import resource from 'resource-router-middleware';

function proceedCompany(co) {
    const newObj = {
        id: co._id,
        text: co.title,
        rate: co.rate
    };

    if (co.children && co.children.length) {
        newObj.children = co.children.map(proceedCompany);
    }

    return newObj;
}

function getNestedChildren(arr, parent) {
    var out = []
    for(var i in arr) {
        if(arr[i].parent == parent) {
            var children = getNestedChildren(arr, arr[i].id)

            if(children.length) {
                arr[i].children = children
            }
            out.push(arr[i])
        }
    }
    return out
}

function setRate(company) {
    company.text += ' | RATE: ' + company.rate;

    if (company.children && company.children.length) {
        company.children = company.children.map(setRate);
        company.totalRate = company.children.reduce((prev, curr) => {
            if (curr.totalRate) {
                return prev + curr.totalRate;
            }

            return prev + curr.rate;
        }
        , 0) + company.rate;

        if (company.totalRate) {
            company.text += ' | TOTAL RATE: ' + company.totalRate;
        }
    }

    return company;
}

export default ({db}) => resource({
    mergeParams: true,
    id: 'company',

    update({body, params}, res) {
        if (!body.title || !body.title.length) return res.sendStatus(500);
        if (!body.rate) body.rate = 0;
        if (!params.company) return res.sendStatus(500);

        const sql = 'UPDATE companies SET name = "'+body.title+'", rate = "'+body.rate+'" WHERE id = "'+params.company+'"';
        db.query(sql, () => res.sendStatus(200));
    },

    list(req, res) {
        db.query('SELECT id, name as text, parent, rate from companies', (err, result) => {
            const tree = getNestedChildren(result).map(setRate);
            const sum = tree.reduce((prev, curr) => prev + (curr.totalRate || 0) + curr.rate, 0);

            res.send([{
                id: 'root',
                text: 'All companies | TOTAL RATE: ' + sum,
                children: tree
            }]);
        });
    },

    /** POST / - Create a new company */
    create({body}, res) {
        if (!body.title || !body.title.length) return res.sendStatus(500);
        if (!body.rate) body.rate = 0;

        let sql = 'INSERT INTO companies (name, rate) VALUES ("' + body.title + '", "' + body.rate + '")';

        if (body.parent) {
            sql = 'INSERT INTO companies (name, rate, parent) VALUES ("' + body.title + '", "' + body.rate + '", "' + body.parent + '")';
        }

        db.query(sql, () => res.sendStatus(200));
    },

    delete({params}, res) {
        if (!params.company) return res.sendStatus(500);

        const sql = 'DELETE FROM companies where id = "'+params.company+'"';
        db.query(sql, () => res.sendStatus(200));
    }
});