// server side validation for listing

const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    title : Joi.string().required(),
    description:Joi.string().required(),
    location:Joi.string().required(),
    price:Joi.string().required().min(0),
    country: Joi.string().required(),
    image:Joi.string().allow("", null)
})


// server side validation for reviewSchema

module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required(),
});