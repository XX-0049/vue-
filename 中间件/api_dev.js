var express = require("express");
var app = express();

//引入mongoDB模块
//获得他的客户端对象 用来连接mongodb
var MongoClient = require("mongodb").MongoClient;

//获得连接mongoDB的字符串，变量名：DB_CONN_STR.
//此编量名是约定俗成的
var DB_CONN_STR = "mongodb://127.0.0.1:27017";

//设置跨域访问(添加这段)
app.all("*", function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "X-Requested-With");
  // res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // res.header("X-Powered-By", " 3.2.1");
  // res.header("Content-Type", "application/json;charset=utf-8");
  // next();

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Max-Age", "3600");
  next();
});

//用于临时存放数据
var _xxObj = {
  arrs: [
    {
      id: "n1",
      name: "a_name",
      vals: "aaa",
    },
    {
      id: "n2",
      name: "b_name",
      vals: "bbb",
    },
    {
      id: "n3",
      name: "c_name",
      vals: "ccc",
    },
  ],
};
//保存过滤的结果
var _filterResult = null;
//过滤方法
function filter(_val) {
  return _xxObj.arrs.filter((_g) => {
    return _g.vals === _val;
  });
}

//第一个nodejs接口，接收
app.get("/node_a", function (req, res) {
  console.log(req.query.v_data);

  let _result = filter(req.query.v_data);
  _filterResult =
    _result.length !== 0 ? _result : [{ id: "xxx", name: "没有结果" }];

  res.end();
});

//第二个接口 发送
app.get("/node_b", function (req, res) {
  res.send(_filterResult);
});

//用户注册信息
app.post("/register_post", function (req, res) {
  let _allData = "";

  req.on("data", function (_d) {
    _allData += _d;
  });

  req.on("end", function (_d) {
    console.log("用户的信息是" + _allData);

    let _registerMsg = JSON.parse(_allData);

    //1.查询 注册之前有无同名
    findSameNameFn(_registerMsg, res);
  });
});

//查询注册同名信息
function findSameNameFn(_registerMsg, res) {
  MongoClient.connect(DB_CONN_STR, function (err, db) {
    //数据库名
    var _dbo = db.db("proShopCart");
    //集合名
    var _collection = _dbo.collection("userInfo");

    _collection.findOne({ username: _registerMsg.username }, {}, function (
      err1,
      result
    ) {
      if (err1) throw err1;

      if (result === null) {
        // console.log("没有同名");
        insertNewUserName(_registerMsg, res);
      } else if (result.username === _registerMsg.username) {
        // console.log("名字相同");
        res.send({
          regInfo: "名字已存在",
          reg_code: 2,
        });
      }

      //关闭数据库连接
      db.close();
    });
  });
}

//插入新用户注册的数据
function insertNewUserName(_registerMsg, res) {
  MongoClient.connect(DB_CONN_STR, function (err, db) {
    //数据库名
    var _dbo = db.db("proShopCart");
    //集合名
    var _collection = _dbo.collection("userInfo");
    _collection.insertOne(_registerMsg, function (err1, result) {
      if (err1) throw err1;
      console.log("注册成功");
      res.send({
        regInfo: "注册成功",
        reg_code: 1,
      });

      //关闭数据库连接
      db.close();
    });
  });
}

//登录功能
app.post("/userLogin_post", function (req, res) {
  var _loginData = "";
  //用req.on(data)接收客户端的数据
  req.on("data", function (_d) {
    _loginData += _d;
  });
  //req.on(end)数据发送完成；
  req.on("end", function (_d) {
    let _tem = JSON.parse(_loginData);

    MongoClient.connect(DB_CONN_STR, function (err, db) {
      //数据库名
      var _dbo = db.db("proShopCart");
      //集合名
      var _collection = _dbo.collection("userInfo");
      //操作
      _collection.findOne({ username: _tem.u }, {}, function (err1, result) {
        if (err1) throw err1;

        if (result === null) {
          console.log("用户不存在");
          return res.send({
            regInfo: "用户不存在",
            reg_code: 5,
          });
        } else if (_tem.p !== result.password) {
          console.log("密码错误");
          return res.send({
            regInfo: "密码错误",
            reg_code: 4,
          });
        } else if (result !== null && _tem.p === result.password) {
          console.log("登录成功");
          return res.send({
            regInfo: result,
            reg_code: 3,
          });
        }

        //关闭数据库连接
        db.close();
      });
    });
  });
});

//批量录入商品
app.post("/insertGoods", function (req, res) {
  var _dataObj = "";

  req.on("data", function (_d) {
    _dataObj += _d;
  });

  req.on("end", function (_d) {
    let _insertGoodsArrObj = JSON.parse(_dataObj);
    // console.log(_insertGoodsArrObj);
    MongoClient.connect(DB_CONN_STR, function (err, db) {
      //数据库名
      var _dbo = db.db("proShopCart");
      //集合名
      var _collection = _dbo.collection("goodsCategory");
      //操作
      _collection.insertMany(_insertGoodsArrObj, function (err1, result) {
        if (err1) throw err1;

        res.send({
          regInfo: "商品录入成功",
          reg_code: 5,
        });

        //关闭数据库连接
        db.close();
      });
    });
  });
});

//获得商品列表大类
app.get("/getGoodsCategory", function (req, res) {
  MongoClient.connect(DB_CONN_STR, function (err, db) {
    //数据库名
    var _dbo = db.db("proShopCart");
    //集合名
    var _collection = _dbo.collection("goodsCategory");
    //操作:连表查询
    _collection.aggregate([{
      $lookup:{
        localField:'d',
        from:'goodsList_a',
        foreignField:'category',
        //存放
        as:'goodsList_aa'
      }
    },
    {
      $lookup:{
        localField:'d',
        from:'goodsList_b',
        foreignField:'category',
        //存放
        as:'goodsList_bb'
      }
    },
    {
      $lookup:{
        localField:'d',
        from:'goodsList_c',
        foreignField:'category',
        //存放
        as:'goodsList_cc'
      }
    },
    {
      $lookup:{
        localField:'d',
        from:'goodsList_d',
        foreignField:'category',
        //存放
        as:'goodsList_dd'
      }
    },
  
  ]).toArray(function (err1, result) {
      if (err1) throw err1;

      res.send(result);

      //关闭数据库连接
      db.close();
    });
  });
});

//批量插入商品到db,只运行一次，把商品插入到点db中就ok
function insertTempGoodsList() {
  let TempGoodsListObj = [{"name" : "奔驰", "price" : 22, "category" : "goodsList_c", "img" : "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1548498667503&di=e4c9c03a08ad310a4d7ee606f5a2750c&imgtype=0&src=http%3A%2F%2Fabc.2008php.com%2F2016_Website_appreciate%2F2016-01-29%2F20160129001721.jpg", "describe" : "产品说明xx123" },
  {"name" : "宝马", "price" : 33, "category" : "goodsList_c", "img" : "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1548498729371&di=a5c603a57243a1d750808980703de6d9&imgtype=0&src=http%3A%2F%2Fassets.pushthink.com%2Fuploads%2Fphoto%2Fimage%2F372568%2F8d0d492f231a72036053639ffb250623.jpg", "describe" : "产品说明xx123" },
  {"name" : "奥迪", "price" : 44, "category" : "goodsList_c", "img" : "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1548498776216&di=b371c5b5bed7ad944d82d7c57864a772&imgtype=0&src=http%3A%2F%2Fi.img16888.com%2Fupload%2FImages%2F2013%2F01%2F2013010604033930126.jpg", "describe" : "产品说明xx123" },
  {"name" : "大众", "price" : 55, "category" : "goodsList_c", "img" : "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1548498827388&di=f0d0f3de9c7c88609de7ec38b35100b0&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01fa73581fd7e8a84a0d304f0b70c9.png%401280w_1l_2o_100sh.png", "describe" : "产品说明xx123" 
  }];

  MongoClient.connect(DB_CONN_STR, function (err, db) {
    //数据库名
    var _dbo = db.db("proShopCart");
    //集合名
    var _collection = _dbo.collection("goodsList_c");
    //操作
    _collection.insertMany(TempGoodsListObj, function (err1, result) {
      if (err1) throw err1;

      //关闭数据库连接
      db.close();
    });
  });
}
// insertTempGoodsList();


//根据id获得对应商品信息
app.get('/getGoodsInfo',function(req,res){
  var  _findId=req.query._id;
  var  _c=req.query._c;

  //生成一个mongodb的id对象
// id是mongodb自生成的用这个方法，自己设置的id不能用
//因为_id是一个ObjectId类型，传入的id只是一个字符串，会导致错误，
var ObjectID = require('mongodb').ObjectID;
var _findObjId = ObjectID.createFromHexString( _findId );

  MongoClient.connect(DB_CONN_STR, function (err, db) {
    //数据库名
    var _dbo = db.db("proShopCart");
    //集合名
    var _collection = _dbo.collection(_c);
    _collection.findOne({"_id":_findObjId},{}, function (err1, result) {
      if (err1) throw err1;
    
      res.send(result);

      //关闭数据库连接
      db.close();
    });
  });

});

//查询栏目所属的商品列表
app.get('/getCategoryGoodsList',function(req,res){

  var  _c=req.query.categoryId;

  MongoClient.connect(DB_CONN_STR, function (err, db) {
    //数据库名
    var _dbo = db.db("proShopCart");
    //集合名
    var _collection = _dbo.collection(_c);
    _collection.find().toArray( function (err1, result) {
      if (err1) throw err1;
    
   res.send(result);

      //关闭数据库连接
      db.close();
    });
  });
})

//分页
app.get('/getPageChange',function(req, res){
	var _s = req.query.startNum;
	var _c = req.query.c;

  if(_s<=0){
    _s=0
  }
  console.log(_s+'和'+_c);
	MongoClient.connect( DB_CONN_STR, function(err, db){
		// 数据库名：proShopCart
		var _dbo = db.db('proShopCart');
		// 商品栏目集合名：goodsCategory
		var _collection = _dbo.collection( _c );
		// 这里一定是双引号
		// .limit()，限制
		_collection.find().limit(2).skip(Number(_s))
			.toArray(function(err1, result){
				if(err1) throw err1;

				 res.send(result);
				db.close();
			});
	});
});
// 轮播图
app.get('/getImgUrls',function(req,res){
	let imgObj = {
		urls:[
                    'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1547663842854&di=bd40adb24bb9f7559c488dcc18c24faf&imgtype=0&src=http%3A%2F%2Fwx1.sinaimg.cn%2Flarge%2F7f6b590cgy1fh45yi4xpkj20yi0jen74.jpg',
                    'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1547663896385&di=0be734cc730ea2b3d869263784a519d6&imgtype=0&src=http%3A%2F%2Fp2.qhimgs4.com%2Ft01f47e00d96e5546ee.jpg',
                    'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1547663913605&di=a33bd590cdbe71086d835bbb3d124b14&imgtype=0&src=http%3A%2F%2F5b0988e595225.cdn.sohucs.com%2Fimages%2F20171008%2F11444774a5774af7a77bb8eb836c3fd3.jpeg',
                    'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1547663942911&di=5e029b8845848bd7675f66f62c2172cd&imgtype=0&src=http%3A%2F%2Fpic39.photophoto.cn%2F20160422%2F0018031335985159_b.jpg'
            ]
	}

	return res.send( imgObj );
})
app.listen(5678, function () {
  console.log("5678,中间件启动");
});
