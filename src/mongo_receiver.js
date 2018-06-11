import { MongoClient } from 'mongodb';

const receiver = (receiverContext) => {
  const { config, log } = receiverContext;
  const { connection, url, collection } = config;

  log.debug('Mongo configuration', receiverContext.config);

  const mongoClient = MongoClient.connect(url, connection)
  const mongoDb = mongoClient.then(c => c.db())

  return (message, messageContext) => new Promise((res, rej) => {
    mongoDb
      .then(c => c.collection(collection))
      .then(c => c.insert(Object.assign({}, message, messageContext)))
      .then(r => res(r))
      .catch((e) => {
        log.error('Unable to index message', { errorMessage: e.message, name: e.name });
        rej(e);
      });
  });
};

export default receiver;
