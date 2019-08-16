const express = require('express');
const {
    ApolloServer,
    gql
} = require('apollo-server-express');
const {
    graphqlMongodbProjection
} = require('graphql-mongodb-projection')

const {
    Database,
    initialize
} = require('./database')
const db = new Database()
const port = process.env.PORT || 3000
// initialize()

const typeDefs = gql `
type Skill {
    id: Int
    description: String
}
type Hero {
    id: Int
    name: String
    power: String
    age: Int
    skill(id: Int, skip: Int = 0, limit: Int = 10): [Skill]
}
type Company {
  id: Int
  description: String
  hero(id: Int, skip: Int = 0, limit: Int = 10): [Hero]
}

type Query {
  getCompany(id: Int, skip: Int = 0, limit: Int = 10): [Company] 
}

schema {
  query: Query
}
`;


// Provide resolver functions for your schema fields
const resolvers = {
    Hero: {
        async skill(company, args, context) {
            const {
                skip,
                limit,
                heroId,
                id
            } = args

            const result = await context.Company.findHeroSkill(company.id, heroId, id, skip, limit)

            return result.map(item => {
                return {
                    description: item.skilldescription,
                    id: item.id
                }
            })

        },
    },
    Company: {
        async hero(company, args, context) {
            const {
                skip,
                limit,
                id
            } = args

            const result = await context.Company.findHero(company.id, id, skip, limit)
            return result.map(item => {
                return {
                    ...item,
                    heroId: item.id
                }
            })
        },
    },
    Query: {
        async getCompany(root, args, context, info) {
            const {
                skip,
                limit,
                id
            } = args
            return context.Company.find(id, skip, limit);
        },
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: {
        Company: {

            find(id, skip, limit) {
                const query = !id ? {} : {
                    id: id
                }
                return db.listCompany(query, ['name', 'description', 'id'], skip, limit)
            },
            findHero(companyid, heroId, skip, limit) {
                let query = {
                    'company.id': companyid
                }
                if (heroId) {
                    query = {
                        ...query,
                        'hero.id': heroId
                    }
                }
                return db.listHeroesFromCompany(query, [
                    'hero.name as name',
                    'hero.power as power',
                    'hero.age as age',
                    'hero.id as id',

                    'company.name as company',
                    'company.id as id'
                ], skip, limit)
            },
            findHeroSkill(companyId, heroId, skillId, skip, limit) {
                let query = {
                    'company.id': companyId
                }
                if (heroId) {
                    query = {
                        ...query,
                        'hero.id': heroId
                    }
                }
                if (skillId) {
                    query = {
                        ...query,
                        'hero_skill.id': skillId
                    }
                }
                return db.listHeroesSkillFromCompany(query, [
                    'hero.id',
                    'hero.name as heroname',
                    'hero.power as heropower',
                    'hero.age as heroage',

                    'hero_skill.description as skilldescription',
                    'hero_skill.id as skillid',

                    'company.name as company'
                ], skip, limit)
            }
        }
    }
});

const app = express();
server.applyMiddleware({
    app
});

app.listen({
        port: port
    }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);