/**
 * Orders migration:
 * Generate and add ID and FID fields to all Orders items.
 */

const _ = require('lodash');
const emoji = require('node-emoji');

module.exports = {
  async up(db) {
    try {
      const orders = await db
        .collection('Orders')
        .find({ items: { $elemMatch: { exchange1C: { $exists: false } } } })
        .toArray();

      // * Note: it can change
      const articleCodesNotInExchange = ['pak_n', 'pak_d', 'pak_sl', 'pak_dl'];

      const generateIDForExchange = (isEmpty) => {
        let id = '';
        const symbols = isEmpty ? '0' : '0123456789abcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < 36; i += 1) {
          id += _.some([8, 13, 18, 23], (x) => x === i)
            ? '-'
            : symbols.charAt(Math.floor(Math.random() * symbols.length));
        }
        return id;
      };

      const operations = orders.map(({ _id, items }) => {
        const featureArticleCodes = _.uniq(items
          .filter((x) => x.item === 'fillingFeature')
          .map((x) => x.articleCode));

        let itemsToUpdate = items
          .map((item) => {
            const exchange1C = {
              ID: generateIDForExchange(),
              FID: generateIDForExchange(true),
            };

            // ! 'work' item is still without articleCode, we're waiting for this field
            // TODO: remove the following part when we got articleCode of 'work'
            if (item.item === 'work') {
              return {
                ...item,
                ...{ exchange1C },
              };
            }

            if (_.isEmpty(item.articleCode) || _.some(articleCodesNotInExchange, (x) => x === item.articleCode)) {
              return item;
            }

            return {
              ...item,
              ...{ exchange1C },
            };
          });

        // Looking for features of fillings to make a reference
        itemsToUpdate = itemsToUpdate
          .map((item) => {
            if (!_.some(featureArticleCodes, (x) => x === item.articleCode)) return item;

            const getDoorIndex = (el) => (el.position && el.position.doorIndex ? el.position.doorIndex : 0);
            const getSectionIndex = (el) => (el.position && el.position.sectionIndex ? el.position.sectionIndex : 0);

            // Filling of current feature
            const itemOfInterest = itemsToUpdate.find((x) => x.articleCode !== item.articleCode
              && x.item === 'filling'
              && getDoorIndex(x) === getDoorIndex(item)
              && getSectionIndex(x) === getSectionIndex(item));

            if (!itemOfInterest) return item;

            return {
              ...item,
              ...{
                exchange1C: {
                  ID: generateIDForExchange(true),
                  FID: itemOfInterest.exchange1C.ID, // FID points to its filling
                },
              },
            };
          });

        return db.collection('Orders').updateOne({ _id }, {
          $set: {
            items: itemsToUpdate,
            updatedOn: new Date().toISOString(),
          },
        });
      });
      const result = await Promise.all(operations);
      console.info(`${emoji.get('gun')} * Migration matches: ${result.length}`);

      return result.length;
    } catch (error) {
      console.error(error);
    }
  },

  async down() {
    return null;
  },
};
