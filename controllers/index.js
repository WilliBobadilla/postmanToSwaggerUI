
async function parse(req, res, next) {
    try {//logic here
        //const register = await Animal.create(req.body);
        console.log(req.body)

        res.render('parse');
        //res.status(200).json(register);
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "There was an error",
        });
    }
}


module.exports = { parse };
