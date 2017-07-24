import {Router} from 'express';
import companies from './companies';
export default ({db}) => {
    let api = Router();
    db.query('CREATE TABLE IF NOT EXISTS companies (id MEDIUMINT NOT NULL AUTO_INCREMENT, name CHAR(30) NOT NULL, rate MEDIUMINT, parent MEDIUMINT, PRIMARY KEY (id))');

    api.use('/companies', companies({db}));

    api.get('/', (req, res) => {
        res.json({version: '1.00'});
    });

    return api;
}