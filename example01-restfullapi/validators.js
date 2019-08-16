const Joi = require('@hapi/joi')

const getHeroesSchema = Joi.object({
    skip: Joi.number().default(0),
    limit: Joi.number().default(10),
    name: Joi.string().max(20)
})

const postHeroesSchema = Joi.object({
    name: Joi.string().max(20).required(),
    power: Joi.string().max(20).required(),
    age: Joi.number().required(),
})

const putHeroesSchema = Joi.object({
    name: Joi.string().max(20).required(),
    power: Joi.string().max(20).required(),
    age: Joi.number().required(),
})

module.exports = {
    getHeroesSchema,
    postHeroesSchema,
    putHeroesSchema
}