import {defineConfig} from '@junobuild/config';

export default defineConfig({
  satellite: {
    ids: {
      development: '<DEV_SATELLITE_ID>',
      production: 'wsm5d-tiaaa-aaaas-al77a-cai'
    },
    source: 'src/garfieldCoin_frontend/dist',
    predeploy: ['npm run build']
  }
});
