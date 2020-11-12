const express = require("express");


const router = express.Router();

// Display the dashboard page
router.get("/", (req, res) => {
  //new DB
  var query = 'select * from player_scores;';
	db.any(query)
        .then(function (rows) {
            res.render('dashboard',{
				data: rows
			})

        })
        .catch(function (err) {
            console.log('error', err);
            res.render('dashboard', {
                data: 'no data'
            })
        })
  
  //old
  //res.render("dashboard");
});


module.exports = router;