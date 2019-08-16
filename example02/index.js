const Express = require('express')
const {
    CREATED,
    OK,
    INTERNAL_SERVER_ERROR,
    getStatusText
} = require('http-status-codes')
const BodyParser = require('body-parser')
const app = Express()
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        // Like the one described here: https://swagger.io/specification/#infoObject
        info: {
            title: 'Erick Wendel - RestfullAPI',
            version: '1.0.0',
            description: 'Web API Example for sub-resources',
        },
    },
    // List of files to be processes. You can also set globs './routes/*.js'
    apis: ['index.js'],
};

const specs = swaggerJsdoc(options);
const swaggerUi = require('swagger-ui-express');


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

app.use(BodyParser.urlencoded())


/**
 * @swagger
 * /company:
 *    get:
 *      description: This should return all companies
 */
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
    /**
     * @swagger
     * /company/:companyid:
     *    get:
     *      description: This should a company
     */
    .get('/company/:companyid', validator.query(getHeroesSchema), async (req, res) => {
        const {
            skip,
            limit
        } = req.query

        const {
            companyid
        } = req.params

        try {
            const result = await db.listCompany({
                'id': companyid
            }, [
                'company.name as company',
                'company.id as id'
            ], skip, limit)

            return res.json(result).status(OK)

        } catch (error) {
            console.error('ERROR***', error.stack)
            return res.json({
                error: getStatusText(INTERNAL_SERVER_ERROR)
            }).status(INTERNAL_SERVER_ERROR)
        }
    })
    /**
     * @swagger
     * /company/:companyid/hero:
     *    get:
     *      description: This should return all company's heroes
     */
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
            console.error('ERROR***', error.stack)
            return res.json({
                error: getStatusText(INTERNAL_SERVER_ERROR)
            }).status(INTERNAL_SERVER_ERROR)
        }
    })
    /**
     * @swagger
     * /company/:companyid/hero/:heroid:
     *    get:
     *      description: This should return a hero from a company
     */
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
            console.error('ERROR***', error.stack)
            return res.json({
                error: getStatusText(INTERNAL_SERVER_ERROR)
            }).status(INTERNAL_SERVER_ERROR)
        }
    })
    /**
     * @swagger
     * /company/:companyid/hero/:heroid/skill:
     *    get:
     *      description: This should return a skills of a hero in a company
     */
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
            console.error('ERROR***', error.stack)
            return res.json({
                error: getStatusText(INTERNAL_SERVER_ERROR)
            }).status(INTERNAL_SERVER_ERROR)
        }
    })
    /**
     * @swagger
     * /company/:companyid:
     *    get:
     *      description: This should a skills of a hero in a specific company
     */
    .get('/company/:companyid/hero/:heroid/skill/:skillid', validator.query(getHeroesSchema), async (req, res) => {
        const {
            skip,
            limit
        } = req.query

        const {
            companyid,
            heroid,
            skillid
        } = req.params

        try {
            const result = await db.listHeroesSkillFromCompany({
                'company.id': companyid,
                'hero.id': heroid,
                'hero_skill.id': skillid
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
            console.error('ERROR***', error.stack)
            return res.json({
                error: getStatusText(INTERNAL_SERVER_ERROR)
            }).status(INTERNAL_SERVER_ERROR)
        }
    })
    /**
     * @swagger
     * /seed/:
     *    get:
     *      description: generate data
     */
    .get('/seed', async (req, res) => {
        try {
            await initialize()
            return res.send({
                success: true
            })
        } catch (error) {
            console.error('ERROR***', error.stack)
            return res.json({
                error: getStatusText(INTERNAL_SERVER_ERROR)
            }).status(INTERNAL_SERVER_ERROR)
        }
    })

app.use('/', swaggerUi.serve, swaggerUi.setup(specs));
app.listen(port, _ => console.log(`running at ${port}`))