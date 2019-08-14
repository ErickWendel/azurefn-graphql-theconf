const Express = require('express')
const {
    CREATED,
    OK,
    INTERNAL_SERVER_ERROR,
    getStatusText
} = require('http-status-codes')
const BodyParser = require('body-parser')
const app = Express()
const {
    createValidator
} = require('express-joi-validation')
const {
    getHeroesSchema,
    postHeroesSchema,
    putHeroesSchema
} = require('./validators')

const {
    initialize,
    Database
} = require('./database')

const validator = createValidator()
const db = new Database()
const port = process.env.PORT || 3000

app.use(BodyParser())
app
    .get('/company', validator.query(getHeroesSchema), async (req, res) => {
        const {
            skip,
            limit
        } = req.query
        try {
            const result = await db.listCompany({}, ['name', 'description', 'id'], skip, limit)
            return res.json(result).status(OK)

        } catch (error) {
            return res.json({
                error: getStatusText(INTERNAL_SERVER_ERROR)
            }).status(INTERNAL_SERVER_ERROR)
        }

    })
    .get('/company/:companyid/hero', validator.query(getHeroesSchema), async (req, res) => {
        const {
            skip,
            limit
        } = req.query

        const {
            companyid
        } = req.params

        try {
            const result = await db.listHeroesFromCompany({
                'company.id': companyid
            }, [
                'hero.name as heroname',
                'hero.power as heropower',
                'hero.age as heroage',
                'hero.id as heroid',

                'company.name as company',
                'company.id as id'
            ], skip, limit)

            return res.json(result).status(OK)

        } catch (error) {
            console.error('DEU RUIM', error.stack)
            return res.json({
                error: getStatusText(INTERNAL_SERVER_ERROR)
            }).status(INTERNAL_SERVER_ERROR)
        }
    })
    .get('/company/:companyid/hero/:heroid', validator.query(getHeroesSchema), async (req, res) => {
        const {
            skip,
            limit
        } = req.query

        const {
            companyid,
            heroid,
        } = req.params

        try {
            const result = await db.listHeroesSkillFromCompany({
                'company.id': companyid,
                'hero.id': heroid
            }, [
                'hero.name as heroname',
                'hero.power as heropower',
                'hero.age as heroage',
                // 'hero.id as heroid',
                'hero_skill.description as skill',

                'company.name as company'
            ], skip, limit)

            return res.json(result).status(OK)

        } catch (error) {
            console.error('DEU RUIM', error.stack)
            return res.json({
                error: getStatusText(INTERNAL_SERVER_ERROR)
            }).status(INTERNAL_SERVER_ERROR)
        }
    })
    .get('/company/:companyid/hero/:heroid/skill', validator.query(getHeroesSchema), async (req, res) => {
        const {
            skip,
            limit
        } = req.query

        const {
            companyid,
            heroid,
        } = req.params

        try {
            const result = await db.listHeroesSkillFromCompany({
                'company.id': companyid,
                'hero.id': heroid
            }, [
                'hero.id',
                'hero.name as heroname',
                'hero.power as heropower',
                'hero.age as heroage',
                'hero_skill.description as skilldescription',
                'hero_skill.id as skillid',

                'company.name as company'
            ], skip, limit)

            return res.json(result).status(OK)

        } catch (error) {
            console.error('DEU RUIM', error.stack)
            return res.json({
                error: getStatusText(INTERNAL_SERVER_ERROR)
            }).status(INTERNAL_SERVER_ERROR)
        }
    })
// .get('/company/:companyid/hero/:heroid/skill/:skillid', validator.query(getHeroesSchema), async (req, res) => {
//     return res.send(`${JSON.stringify(req.params)}`).status(OK)
// })

// .post('/heroes', validator.body(postHeroesSchema), async (req, res) => {
//     return res.send({
//         result: `${JSON.stringify(req.body)}`
//     }).status(CREATED)
// })
// .put('/heroes/:id', validator.body(putHeroesSchema), async (req, res) => {
//     return res.send(`${JSON.stringify(req.body)}`).status(OK)

// })
// .delete('/heroes/:id', async (req, res) => {
//     return res.send(`${JSON.stringify(req.params)}`).status(OK)

// })

app.listen(port, _ => console.log(`running at ${port}`))

async function main() {
    // const db = new Database()
    // console.log(await db.listhSkillHerosFromCompany({
    //     // 'company.name': 'Prohaska and Sons'
    // }, ['hero.name as hero', 'company.name as company', 'hero_skill.description as skill'], 0, 2))

    // await initialize()
}
main()