const faker = require('faker')

const knex = require('knex')({
    client: 'pg',
    connection: process.env.POSTGRES_URL
});

const COMPANY_TABLE = 'company'
const HERO_TABLE = 'hero'
const HEROSKILL_TABLE = 'hero_skill'

async function createTableIfNotExists(tableName, cb) {
    const exists = await knex.schema.hasTable(tableName)
    if (exists) return cb();

    await knex.schema.createTable(tableName, cb);

}

async function generateCompanyData() {
    const countItems = 100
    let count = 0
    const items = []
    while (count < countItems) {
        const name = faker.company.companyName()
        const description = faker.hacker.noun()
        console.log({
            name,
            description
        })

        items.push({
            name,
            description
        })
        count++

    }

    const insert = await knex(COMPANY_TABLE).insert(items, ['id'])

    return insert.map(({
        id
    }) => id)
}

async function generateHeroData(companyIds) {
    const countItems = 100
    let count = 0
    const items = []
    while (count < countItems) {
        const name = faker.name.title()
        const power = faker.hacker.noun()
        const age = faker.random.number()
        const companyId = companyIds[count]

        items.push({
            name,
            power,
            age,
            company_id: companyId
        })
        count++
    }
    const insert = await knex(HERO_TABLE).insert(items, ['id'])

    return insert
        .map(({
            id
        }) => id)
}

async function generateHeroSkillData(heroIds) {
    const countItems = 100
    let count = 0
    const items = []
    while (count < countItems) {
        const description = faker.hacker.noun()
        const heroId = heroIds[count]

        items.push({
            hero_id: heroId,
            description,
        })
        count++
    }
    const insert = await knex(HEROSKILL_TABLE).insert(items, ['id'])

    return insert
        .map(({
            id
        }) => id)
}

async function initialize() {

    await knex.schema.dropTableIfExists(HEROSKILL_TABLE)
    await knex.schema.dropTableIfExists(HERO_TABLE)
    await knex.schema.dropTableIfExists(COMPANY_TABLE)

    await createTableIfNotExists(COMPANY_TABLE, (table) => {
        if (!table) return;
        table.string('name').notNullable();
        table.string('description').notNullable();
        table.increments('id');
    });

    await createTableIfNotExists(HERO_TABLE, (table) => {
        if (!table) return;
        table.integer('company_id').unsigned().notNullable();

        table.increments('id');
        table.string('name').notNullable();
        table.string('power').notNullable();
        table.integer('age').notNullable();
        table.foreign('company_id').references('id').inTable(COMPANY_TABLE);
    });

    await createTableIfNotExists(HEROSKILL_TABLE, (table) => {
        if (!table) return;
        table.integer('hero_id').unsigned().notNullable();

        table.increments('id');
        table.string('description').notNullable();
        table.foreign('hero_id').references('id').inTable(HERO_TABLE);
    });

    await Promise.all([
        knex(COMPANY_TABLE).delete(),
        knex(HERO_TABLE).delete(),
        knex(HEROSKILL_TABLE).delete()
    ])
    const companyIds = await generateCompanyData()
    const heroIds = await generateHeroData(companyIds)
    await generateHeroData(companyIds.reverse())
    await generateHeroSkillData(heroIds)
    await generateHeroSkillData(heroIds.reverse())

}


// ---
class Database {
    constructor() {}
    async create(company, hero, power) {
        return knex(COMPANY_TABLE)
    }

    async update(id, data) {
        return this.dbInstance.where({
            id
        }).update(data)
    }
    async delete(id) {
        return this.dbInstance.where({
            id: id
        }).del()
    }


    async listHeroesSkillFromCompany(query, projection, skip, limit) {
        return knex.from(COMPANY_TABLE)
            .where(query)
            .select(projection)
            .innerJoin(HERO_TABLE, `${HERO_TABLE}.company_id`, `${COMPANY_TABLE}.id`)
            .innerJoin(HEROSKILL_TABLE, `${HEROSKILL_TABLE}.hero_id`, `${HERO_TABLE}.id`)
            .offset(skip)
            .limit(limit)
    }
    async listHeroesFromCompany(query, projection, skip, limit) {
        return knex.from(COMPANY_TABLE)
            .innerJoin(HERO_TABLE, `${COMPANY_TABLE}.id`, `${HERO_TABLE}.company_id`)
            .where(query)
            .select(projection)
            .offset(skip)
            .limit(limit)

    }

    async listCompany(query, projection, skip, limit) {
        return knex.from(COMPANY_TABLE).where(query).select(projection).offset(skip).limit(limit)
    }
}


module.exports = {
    initialize,
    Database
}
// db.serialize(function () {
//     db.run("CREATE TABLE lorem (info TEXT)");

//     var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (var i = 0; i < 10; i++) {
//         stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();

//     db.each("SELECT rowid AS id, info FROM lorem", function (err, row) {
//         console.log(row.id + ": " + row.info);
//     });
// });

// db.close();