var bodyParser          = require("body-parser"),
mongoose                = require("mongoose"),
express                 = require("express"),
methodOverride          = require("method-override"),
passport                = require("passport"),
localStrategy           = require("passport-local"),
User                    = require("./public/model/user"),
expressSession          = require("express-session"),
passportLocalMongoose   = require("passport-local-mongoose");
const user = require("./public/model/user");

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set('useFindAndModify', false);

var app = express();
app.set("view engine", "ejs");
app.use(express.static("public/stylesheets"));
app.use(express.static("public/scripts"));
app.use(express.static("views/partials"));
app.use(express.static("rcs"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: false
}));
app.use(bodyParser.json({limit: "50mb"}));
passport.use(new localStrategy(User.authenticate()));
app.use(expressSession({
    secret: "<<___LOCALHOST 3000___SECURE LOGIN SYSTEM___>>",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect("mongodb://localhost/restaurants"); 

// User.register(new User({username:"omardalal"}), "Password"); //Creating a new user

var resSchema = new mongoose.Schema({
    name: String,
    about: String,
    logo: {data: Buffer, imageType: String},
    branches: [String],
    menu: [{data: Buffer, imageType: String}],
    number: String,
    cities: [String],
    categories: [String],
    reviews: [{name: String, stars: String, review: String, date: String}],
    opTime: Number,
    clTime: Number
});

var Res = mongoose.model("Res", resSchema);

app.get("/results", function(req, res) {
    Res.find({}, function (err, results) {
        if (err) {
            res.render("home");
        } else {
            res.render("results", [rests=results]);
        }
    });
});

app.post("/results", function(req, res) {
    Res.find({name: {$regex : ".*"+req.body.resName.toLowerCase()+".*"}}, function(err, results) {
        if (err) {
            res.render("home");
        } else {
            res.render("results", [rests=results]);
        }
    });
});

app.post('/review', function(req, res) {
    Res.findByIdAndUpdate(req.body.restId, { $addToSet: {reviews: {name: req.body.revName, stars: req.body.stars, review: req.body.revBody, date: Date().substring(4,16)}}}, function(err, result) {
        if (err) {
            res.render('res');
        } else {
            res.redirect('/results/'+req.body.restId);
        }
    });
});

app.get("/results/:id", function(req, res) {
    Res.findById(req.params.id, function(err, rest) {
        if (err) {
            res.render("home");
        } else {
            if (rest != null && rest != undefined) {
                res.render("res", [restData=rest]);
            } else {
                res.render("home");
            }
        }
    })
});

app.get("/search/city/:cityName", function(req, res) {
    var city = req.params.cityName[0].toUpperCase()+req.params.cityName.substring(1);;
    Res.find({cities: {$regex : city}}, function(err, results) {
        if (err) {
            res.render("home");
        } else {
            if (results!=null&&results!=undefined) {
                res.render("results", [rests = results]);
            }
        }
    });
});

app.get("/search/category/:category", function(req, res) {
    var category = req.params.category[0].toUpperCase()+req.params.category.substring(1);;
    Res.find({categories: {$regex : category}}, function(err, results) {
        if (err) {
            res.render("home");
        } else {
            if (results!=null&&results!=undefined) {
                res.render("results", [rests = results]);
            }
        }
    });
});

app.get("/admin", function(req, res) {
    if (req.isAuthenticated()) {
        res.render('dashboard');
    } else {
        res.render("admin");
    }
});

app.post("/admin", usernameToLowerCase, passport.authenticate("local", {
        failureRedirect: "/admin",
        successRedirect: '/dashboard'
    }), function(req, res) {
});

function usernameToLowerCase(req, res, next){
    req.body.username = req.body.username.toLowerCase();
    next();
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/admin");
    }
}

app.get("/dashboard/new", isLoggedIn, function(req, res) {
    if (req.user.restId!=undefined) {
        res.redirect("/dashboard/"+req.user.restId+"/edit");
    } else {
        res.render('new');
    }
});

app.post('/dashboard/:id/editPass', isLoggedIn, function(req, res) {
    if (req.user.restId==undefined) {
        User.findByIdAndUpdate(req.params.id, {username: req.body.username}, function(err, acc) {
            if (!err) {
                acc.setPassword(req.body.password, function() {
                    acc.save();
                });
            }
            res.redirect('/dashboard');
        });
    } else if (req.user.restId==req.params.id) {
        User.findByIdAndUpdate(req.params.id, {username: req.body.username}, function(err, acc) {
            if (!err) {
                acc.setPassword(req.body.password);
            }
            res.redirect('/dashboard/'+req.user.restId+'/edit');
        });
    } else {
        res.redirect('/dashboard/'+req.user.restId+'/edit');
    }
});

app.get('/dashboard/:id/editPass', isLoggedIn, function(req, res) {
    if (req.user.restId==undefined) {
        User.find({restId: req.params.id}, function(err, acc) {
            if (err) {
                res.redirect('/dashboard');
            } else {
                res.render('editPass', [account=acc[0]]);
            }
        });
    } else if (req.user.restId==req.params.id) {
        User.find({restId: req.params.id}, function(err, acc) {
            if (err) {
                res.redirect('/dashboard/'+req.user.restId+'/edit');
            } else {
                res.render('editPass', [account=acc[0]]);
            }
        });
    } else {
        res.redirect('/dashboard/'+req.user.restId+'/edit');
    }
});

app.post("/dashboard/new", isLoggedIn, function (req, res) {
    if (req.user.restId==undefined) {
        var newRest = initRest(req);
        Res.create(newRest, function(err, rest) {
            if (err) {
                res.render("new");
            } else {
                User.find({username:req.body.username}, function (err, results) {
                    if (err) {
                        res.render("new");
                    } else {
                        if (results.length==0) {
                            User.register(new User({username:req.body.username.toLowerCase(), restId:rest._id}), req.body.password);
                        } else {
                            res.redirect('/dashboard/new');
                        }
                    }
                });
                res.redirect("/dashboard");
            }
        });
    }
});

app.post("/dashboard", isLoggedIn, function(req, res) {
    Res.find({name: {$regex : ".*"+req.body.resName.toLowerCase()+".*"}}, function(err, results) {
        if (err) {
            res.render("home");
        } else {
            if (req.user.restId!=undefined) {
                res.render("results", [rests=results]);
            } else {
                res.render("dashboard", [rests=results]);
            }
        }
    });
});

app.get("/dashboard", isLoggedIn, function(req, res) {
    Res.find({}, function(err, results) {
        if (err) {
            res.render("home");
        } else {
            if (req.user.restId!=undefined) {
                res.redirect('/dashboard/'+req.user.restId+'/edit');
            } else {
                res.render("dashboard", [rests=results]);
            }
        }
    });
});

app.get("/dashboard/:id/edit", isLoggedIn, function(req, res) {
    Res.findById(req.params.id, function(err, rest) {
        if (err) {
            res.render("dashboard");
        } else {
            if (req.user.restId!=undefined) {
                if (req.params.id!=req.user.restId) {
                    res.redirect('/dashboard/'+req.user.restId+'/edit');
                } else {
                    res.render("edit", [restData=rest, authed=false]);
                }
            } else {
                res.render("edit", [restData=rest, authed=true]);
            }
        }
    });
});

app.put("/dashboard/:id/edit", function(req, res) {
    if (req.user.restId!=undefined&&req.user.restId!=req.params.restId) {
        res.render('dashboard');
    } else {
        var newRest = initRest(req);
        if (req.user.restId==undefined) {
            var revArr = initRevs(req);
            newRest.reviews = revArr;
        }
        Res.findByIdAndUpdate(req.params.id, newRest, function(err, rest) {
            res.redirect("/dashboard");
        });
    }
});

function initRevs(req) {
    var text = req.body.reviews;
    if (text!=null&&text!=undefined&&text!='') {
        var revs = text.split(',{');
        if (revs!=null&&revs!=undefined&&revs.length>0) {
            var revArr = [];
        for (var i=0; i<revs.length; i++) {
            var rev = {
                name: String,
                stars: String,
                review: String,
                date: String
            }
            var j = revs[i].search('name')+7;
            while (revs[i][j]!="'") {
                rev.name+=revs[i][j];
                j++;
            }
            j = revs[i].search('stars')+8;
            while (revs[i][j]!="'") {
                rev.stars+=revs[i][j];
                j++;
            }
            j = revs[i].search('review')+9;
            while (revs[i][j]!="'") {
                rev.review+=revs[i][j];
                j++;
            }
            j = revs[i].search('date')+7;
            while (revs[i][j]!="'") {
                rev.date+=revs[i][j];
                j++;
            }
            rev.name = rev.name.replace('function String() { [native code] }','');
            rev.stars = rev.stars.replace('function String() { [native code] }','');
            rev.date = rev.date.replace('function String() { [native code] }','');
            rev.review = rev.review.replace('function String() { [native code] }','');
            revArr.push(rev);
        }
        return revArr;
        }
    } else {
        return [];
    }
}

function initRest(req) {
    var cityList = req.body.cities.trim().split(",");
    var categoryList = req.body.categories.trim().split(",");
    removeEmpty(cityList);
    removeEmpty(categoryList);
    var logoDecoded = decodeImg(req.body.logo);
    var menuDecoded = [];
    var menuLength=req.body.menu.length;
    if (menuLength>20) {
        menuLength=1;
        for (var i=0; i<menuLength; i++) {
            menuDecoded[i]=decodeImg(req.body.menu);
        }
    } else {
        for (var i=0; i<menuLength; i++) {
            menuDecoded[i]=decodeImg(req.body.menu[i]);
        }
    }
    var opTime = req.body.opTime;
    var clTime = req.body.clTime;
    opTime = conv24(opTime);
    clTime = conv24(clTime);
    var newRest = {
        name: req.body.name.toLowerCase().trim(),
        about: req.body.about.trim(),
        logo: logoDecoded,
        menu: menuDecoded,
        branches: req.body.branches,
        number: req.body.number.trim(),
        cities: cityList,
        categories: categoryList,
        opTime: opTime,
        clTime: clTime
    };
    return newRest;
}

function conv24(time) {
    var hr = time.substring(0,2).trim();
    var ap = time.substring(3,5);
    var convHr = 0;
    if (ap.toLowerCase()=='am') {
        if (hr!='12') {
            convHr = Number(hr);
        }
    } else {
        if (hr=='12') {
            convHr = 12;
        } else {
            convHr = Number(hr)+12;
        }
    }
    return convHr;
}

function decodeImg(imgEncoded) {
    if (imgEncoded!=null) {
        var imgDecoded = JSON.parse(imgEncoded);
        if (imgDecoded!=null) {
            var img = {
                data: new Buffer.from(imgDecoded.data, 'base64'),
                imageType: imgDecoded.type
            }
            return img;
        }
    }
}

function removeEmpty(arr) {
    for (var i=0; i<arr.length; i++) {
        if (arr[i].trim()==""||arr[i].trim()==","||arr[i].trim()==",,") {
            for (var j=i; j<arr.length-1; j++) {
                arr[j] = arr[j+1];
            }
            arr.pop();
        }
    }
}

app.get("/dashboard/:id/delete", isLoggedIn, function(req, res) {
    if (req.user.restId==undefined) {
        Res.findByIdAndDelete(req.params.id, function(err, rest) {
            User.findOneAndDelete({restId: req.params.id}, function(err, rest) {
                res.redirect("/dashboard");
            });
        });
    }
});

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/logOut", function(req, res) {
    req.logOut();
    res.render("admin");
});

app.get("*", function(req, res) {
    res.redirect("/");
});

app.listen(3000, function(req, res) {
    console.log("SERVER STARTED ON PORT 3000");
});