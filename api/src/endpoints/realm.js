const { notFound } = require('boom');
const { body, param } = require('express-validator/check');
const { Realm } = require('../models');
const { checkValidationResult } = require('../services/errorHandler');

module.exports.create = [
  body('name')
    .not().isEmpty()
    .isLength({ min: 1, max: 25 })
    .trim(),
  checkValidationResult,
  (req, res, next) => {
    const generator = 'Platform';
    // const generator = 'CSD';
    const size = 16;
    const realm = new Realm({
      creator: req.user._id,
      name: req.body.name,
      size,
      voxels: Realm.generateVoxels({ generator, size }),
    });
    realm
      .save()
      .then(({ slug }) => (
        res.json(slug)
      ))
      .catch(next);
  },
];

module.exports.get = [
  param('slug')
    .not().isEmpty()
    .isLowercase(),
  checkValidationResult,
  (req, res, next) => {
    Realm
      .findOne({
        slug: req.params.slug,
      })
      .select('creator name size')
      .populate('creator', 'name')
      .then((realm) => {
        if (!realm) {
          throw notFound();
        }
        res.json({
          ...realm._doc,
          creator: realm.creator.name,
        });
      })
      .catch(next);
  },
];

module.exports.getVoxels = [
  param('id')
    .isMongoId(),
  checkValidationResult,
  (req, res, next) => {
    Realm
      .findById(req.params.id)
      .select('updatedAt')
      .then((realm) => {
        if (!realm) {
          throw notFound();
        }
        const lastModified = realm.updatedAt.toUTCString();
        if (req.get('if-modified-since') === lastModified) {
          return res.status(304).end();
        }
        return Realm
          .findById(realm._id)
          .select('-_id voxels')
          .then(({ voxels }) => (
            res
              .set('Cache-Control', 'must-revalidate')
              .set('Content-Type', 'text/plain')
              .set('Last-Modified', lastModified)
              .send(voxels)
          ));
      })
      .catch(next);
  },
];

module.exports.remove = [
  param('id')
    .isMongoId(),
  checkValidationResult,
  (req, res, next) => {
    Realm
      .deleteOne({
        _id: req.params.id,
        creator: req.user._id,
      })
      .then(() => (
        res.status(200).end()
      ))
      .catch(next);
  },
];