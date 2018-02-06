const mongoose = require('mongoose');
const csvStringify = require('csv-stringify');
const _ = require('lodash');

class Facade {
  constructor(name, schema) {
    this.model = mongoose.model(name, schema);
    this.Model = this.model;
    this.exportColumns = _.mapValues(this.model.schema.paths, v => v.path);
  }

  create(body) {
    const model = new this.Model(body);
    return model.save();
  }

  find(...args) {
    return this.model
      .find(...args)
      .exec();
  }

  cursorFind(iterate, ...args) {
    return new Promise((fulfill) => {
      const cursor = this.model
      .find(...args)
      .cursor();
      const next = promise => promise
        .then( doc =>  (doc ? iterate(doc, () => next(cursor.next())) : fulfill()) );
      next(cursor.next());
    });
  }

  async paginatedFind(page, limit, ...args) {
    limit = limit <= 100 ? limit : 100;
    page = page > 0 ? page : 1;
    const count = await this.model
      .find(...args)
      .count();
    const pagesCount = Math.ceil(count / limit);
    const data = await this.model
      .find(...args)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return { limit, page, pagesCount, count, data };
  }

  findOne(...args) {
    return this.model
      .findOne(...args)
      .exec();
  }

  findById(...args) {
    return this.model
      .findById(...args)
      .exec();
  }

  update(...args) {
    return this.model
      .update(...args)
      .exec();
  }

  remove(...args) {
    return this.model
      .remove(...args)
      .exec();
  }

  writeCsvStream(stream, find, exportColumns) {
    const quotesCursor = this.model.find(find).sort({ _id: -1 }).cursor();
    quotesCursor
    .pipe(csvStringify({
      columns: exportColumns || this.exportColumns,
      header: true,
      formatters: {
        object: o => JSON.stringify(o)
      }
    }))
    .pipe(stream);
  }

}

module.exports = Facade;
