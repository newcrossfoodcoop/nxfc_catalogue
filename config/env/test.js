'use strict';

module.exports = {
	mongo: { db: 'nxfc-catalogue-test' },
	app: {
		title: 'NXFC Catalogue - Test Environment'
	},
	worker: {
        port: 3015
    },
    api: {
        port: 3011
    },
    pricing: {
        marginRate: 0
    }
};
