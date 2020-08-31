<template>
  <div>
 
        <van-button v-if="isLogin" type="danger" 
    @click="entryGoodsToDb">录入商品</van-button>


    <div class="wrapDiv cle">
      <van-tabs @click="headColumnFn" v-model="tabActive" swipeable>
        <van-tab v-for="(item,inx) in getGoodsCategoryData" 
        :key=inx
        :title=item.n>
            <!-- <img :src=item.i class="imgSize" /> -->
            <h1>{{item.d}}</h1>
        </van-tab>
      </van-tabs>


        <!-- 商品录入框 -->
    <div v-if="isEntryGoods" class="goodsEntry cle">
      <div v-for="item in emptyGoodsDomArr" :key='item'>
        <entryGoods @pushGoodsInfo="pushGoodsInfo" @isVoidFalse="isVoidFalse" />
      </div>
      <van-button type="danger" @click="addGoodsInputBtn">+</van-button>
      <van-button type="danger" @click="submitBtn">提交新的商品</van-button>
      <van-button type="danger" @click="cancelBtn">取消</van-button>
    </div>

    </div>

    <div class="entryGoodsDivBg" v-if='isEntryGoodsdDivBg'>    </div>
<!-- 竖向分类栏 -->
<div class="sideBarFn">
    <van-sidebar v-model="activeBadgeKey" >
  <van-sidebar-item 
  v-for="(item,inx) in getGoodsCategoryData"
  :key=inx
  :title=item.n
  @click="onBadgeChange" />
 
</van-sidebar>
</div>

	<!-- 显示竖向栏目的数据 -->
		<div class="columnData">
			<ul v-for="item in goodsListData" 
      @click="gotoGoodsProduct(item)">
				<li> <img :src="item.img" /> </li>
				<li> {{item.name}} </li>
				<li> ￥{{item.price}} </li>
				<li> {{item.describe}} </li>
			</ul>
		</div>

<!-- 分页 -->
<div class="pageChange">
<van-pagination v-model="currentPage" 
:page-count=totalItems mode="simple"
:items-per-page=2
@change="pageChangeFn"/>
</div>

    <footerBar></footerBar>
  </div>
</template>

<script>
import axios from "axios";
import API_LIST from "@/APIList.config";
import footerBar from "./footerBar";
import entryGoods from "./entryGoods";

export default {
  name: "goodsType",
  data() {
    return {
      msg: "商品分类页",

      //分页
      currentPage:0,
      totalItems:0,


      tabActive: "",
      isLogin:false,
      isEntryGoods: false,
      activeBadgeKey:0,

      //四个框填完了没
      isGoodsInfoWrite: false,
      isNameRepeat: true,

      //空的空白的录入框
      emptyGoodsDomArr: [{}],

      isEntryGoodsdDivBg:false,

      //接收录入商品的总的大对象
      entryGoodsObj: [],

      //获得商品大类
      getGoodsCategoryData: "",
      
      //竖向栏目
      goodsListData:[],
    };
  },
  components: { entryGoods,footerBar },

  created() {
  
  //获得商品大类
    this.getGoodsCategoryFn();

//竖向栏目列表
    this.getCategoryGoodsListFn('goodsList_a');
  
//如果没有数据，下面都不执行
if(!localStorage.userName){
return
}

         if (localStorage.userName) {
      this.$notify(JSON.parse(localStorage.userName).username + "您已经登录");
     
      
    }
    // console.log(JSON.parse(localStorage.userName)._id);
    let _n=JSON.parse(localStorage.userName)._id;
    if(localStorage.userName&&_n==='5f3cc413e231c849b0e5b39f'){

   this.isLogin = true;
    }
  },
watch:{
  activeBadgeKey(_inx){
        let _c=this.getGoodsCategoryData[_inx].d;
    this.getCategoryGoodsListFn(_c);
    
    //分页
    this.currentPage=1;
    this.pageChangeFn();
  }
  
},
 methods: {
   // 跳转到产品详情页
		gotoGoodsProduct( _item ){
			// console.log( _item )
			this.$router.push({
                name:'goodsProduct',
                query:{ 
                  _goodsObjId:_item._id,
                  _collectionName : _item.category
                }
            });
		},
   //分页时触发
 	pageChangeFn(){
			// console.log( this.currentPage )
			/*
				点击下一页时，你要跳过的文档数是，
				(currentPage-1) *每页显示2个

				例如，你点击下一页时，显示第3页
				(3-1)，已经翻过2页，
				2*2，你一共需要跳过4个文档，
				即，第3页要显示的第一个文档，
				其实是总文档数的第5个。

				所以在翻页的接口，你要传入二个值，
					- 要跳过的文档数，
					- 你要查询的集合，
      */
      console.log("集合数据")
			console.log( this.getGoodsCategoryData )
			// 获得集合的名，它里面的索引，跟分页没关系
      let _c = '';
			if( !this.getGoodsCategoryData ){
				_c = 'goodsList_a';
			} else {
        _c = this.getGoodsCategoryData[this.activeBadgeKey].d;

  
        console.log('集合名');
        console.log(_c);
      }
      
console.log(this.currentPage);

			axios.get( API_LIST.getPageChange,{
						params:{
              
							startNum:(this.currentPage-1)*2,
							c: _c
						}
					})
					.then( _d=>{
						console.log( _d.data );
						this.goodsListData = _d.data;
					});

		},
    //横向分类栏
    headColumnFn(_inx){
      //竖向栏目的索引
this.activeBadgeKey=_inx;
    },
//竖向分类栏
onBadgeChange(_key){

this.activeBadgeKey=_key;
console.log(this.getGoodsCategoryData[_key].d)
    let _c=this.getGoodsCategoryData[_key].d;
    this.getCategoryGoodsListFn(_c)
 //横向栏目的索引
    this.tabActive=_key;
},
// 查询栏目所属的商品列表
		getCategoryGoodsListFn( _c ){
			axios.get( API_LIST.getCategoryGoodsList,{
					params:{ categoryId : _c }
				})
				.then( _d=>{
          // console.log( _d.data );
          //分类下的所有商品总数
          this.totalItems=_d.data.length;
					// this.goodsListData = _d.data;
				});
		},






    //添加商品到总的商品信息数组的对象
    pushGoodsInfo(_goodsInfoObj) {
      //判断商品名称是否重复
      let _is = true;
      for (let i = 0; i < this.entryGoodsObj.length; i++) {
        if (this.entryGoodsObj[i].n === _goodsInfoObj.n) {
          _is = false;
          break;
        }
      }
      if (_is) {
        this.entryGoodsObj.push(_goodsInfoObj);
        this.isNameRepeat = true;
      } else {
        this.isNameRepeat = false;
        this.$dialog.alert({
          message: "商品重名了",
        });
      }

      //四个框全写完了
      this.isGoodsInfoWrite = true;
    },
    //四个框没写完触发
    isVoidFalse() {
      this.isGoodsInfoWrite = false;
    },

    //四个框全部填完并且不重名才能添加空白框
    addGoodsInputBtn() {
      let _is = "";
      if (this.isGoodsInfoWrite && this.isNameRepeat) {
        this.emptyGoodsDomArr.push({});
      } else {
        this.$dialog.alert({
          message: "有框还没写完",
        });
      }
    },

    //提交新商品
    submitBtn() {
      // console.log(this.entryGoodsObj);

      axios.post(API_LIST.insertGoods, this.entryGoodsObj).then((_d) => {
        console.log(_d.data);
        this.$dialog
          .alert({
            message: _d.data.regInfo,
          })
          .then(() => {
            //商品录入窗口关闭
            this.isEntryGoods = false; 
            this.isEntryGoodsdDivBg= false;
            //空白输入框的数量重置
            this.emptyGoodsDomArr = [{}];
           
            //更新页面，获得商品大类
            this.getGoodsCategoryFn();
          });
      });
    },
    //取消提交商品
cancelBtn(){
  this.isEntryGoods = false;
this.isEntryGoodsdDivBg= false;
},
    //录入商品
    entryGoodsToDb() {
      this.isEntryGoods = true;
      this.isEntryGoodsdDivBg= true;
    },

    //获得所有的商品的大类
    getGoodsCategoryFn() {
      axios.get(API_LIST.getGoodsCategory).then((_d) => {
        // console.log(_d.data);
        this.getGoodsCategoryData = _d.data;
      });
    },



  },
};
</script>

<style scoped>
	h1, h2 {
        font-weight: normal;
      }
      ul {
        list-style-type: none;
        padding: 0;
      }
      li {
        display: inline-block;
        margin: 0 10px;
      }
      a {
        color: #42b983;
      }
      .cle:after{
	        content: '.';
	        overflow: hidden;
	        visibility: hidden;
	        height: 0;
	        display: block;
	        clear: both;
	      }
      .wrapDiv{
        width: 80%;overflow: hidden;border: 1px solid #666;
        background: #eee;border-radius: 10px;
        margin:10px auto;
      }
      .wrapDiv p.tip{
        font-size: 14px;text-align: center;padding: 0;margin:5px 0;color: #666;
      }
       .goodsCategory{clear: both;margin: 10px 0;height: 50px;}
      .goodsCategory:hover{
          background: #ddd;
      }
      .goodsCategory li{float: left; font-size: 14px;height:50px;line-height: 50px;}
      .goodsCategory li img{
            width: 50px;height: 50px;border-radius: 10px;
            border:1px solid #666;
          }
      .goodsEntry{
        width: 80%; position: absolute;top: 10%;left: 50%;margin-left: -42%;
	    z-index: 112;padding:10px;background:#ddd;
        border-radius: 10px;border:1px solid #999;
        line-height: 30px;text-align: center;
        font-size: 16px;
      }
      .entryGoodsDivBg{
	            width: 100%;height: 100%;background: #000;opacity: 0.3;
	            z-index: 111;position: absolute;top: 0;left: 0;
	      }
	  .imgSize{width: 100%;height: 100%;}
	  .sideBarFn{
	      		width: 80px;position: absolute;top: 330px;left: 0;z-index: 10;
	      }
      .columnData{
      		clear: both;width: 70%;background: #eee;
      		border-radius: 10px;border: 1px solid #666;
      		margin:0 0 0 90px;
      }
      .columnData ul{
      	display: block;clear: both;overflow: hidden;margin:10px 0;
      	background: #ddd;
      }
      .columnData ul li{
      		float: left;margin:5px;
      }
      .columnData ul li.tip{background: #eee;padding:2px;}
      .columnData ul li img{
      		width:50px;height: 50px;
      }

	.pageChange{
	      	width: 85%;
	    float: right;
	    clear: both;
	  }
</style>