const errors = require('./errors');

function removePaginationInfo(req) {
  delete req.query.limit;
  delete req.query.page;
  return req;
}

class Controller {
  constructor(facade) {
    this.facade = facade;
    this.findOptions = {};
    this.findSelect = null;
  }

  isDefined(method){
    if(typeof this.facade[method] != 'function'){
      throw new errors.NotImplemented();
    }
  }

  create(req, res, next) {
    this.isDefined('create');
    this.facade.create(req.body)
      .then(doc => res.status(201).json(doc))
      .catch(err => next(err));
  }

  find(req, res, next) {
    this.isDefined('paginatedFind');
    const limit = Math.abs(parseInt(req.query.limit, 10));
    const page = parseInt(req.query.page, 10);
    return this.facade.paginatedFind(page, limit, removePaginationInfo(req).query, this.findSelect, this.findOptions)
      .then(results => res.status(200).json(results))
      .catch(err => next(err));
  }

  findOne(req, res, next) {
    this.isDefined('findOne');
    return this.facade.findOne(req.query, this.findSelect, this.findOptions)
      .then(doc => res.status(200).json(doc))
      .catch(err => next(err));
  }

  findById(req, res, next) {
    this.isDefined('findById');
    return this.facade.findById(req.params.id, this.findSelect ,this.findOptions)
      .then((doc) => {
        if (!doc) { throw new errors.NotFound(); }
        return res.status(200).json(doc);
      })
      .catch(err => next(err));
  }

  update(req, res, next) {
    this.isDefined('update');
    this.facade.update({ _id: req.params.id }, req.body)
      .then((results) => {
        if (results.n < 1) { throw new errors.NotFound(); }
        if (results.nModified < 1) { return res.sendStatus(304); }
        res.sendStatus(204);
      })
      .catch(err => next(err));
  }

  remove(req, res, next) {
    this.isDefined('remove');
    this.facade.remove({ _id: req.params.id })
      .then((doc) => {
        if (!doc) { throw new errors.NotFound(); }
        return res.sendStatus(204);
      })
      .catch(err => next(err));
  }

  export(req, res, next) {
    this.isDefined('writeCsvStream');
    if (req.accepts('text/plain')) {
      res.type('text/plain');
    } else {
      res.type('text/csv');
      res.set('Content-disposition', `attachment; filename=${this.facade.name || 'export'}-${Date.now()}.csv`);
    }
    return this.facade.writeCsvStream(res, req.query, this.findSelect, this.findOptions, this.exportColumns);
  }
}

module.exports = Controller;
