<template>
  <div>
    <van-nav-bar :title=msg left-text="返回" 
    left-arrow @click-left="goBack" />
    <div class="goodsImgWarp">
      <img :src="goodsImgUrl" heigth="100%" width="100%" />
    </div>
    <p>{{goodsTitle}},{{describe}},￥{{price}}</p>

    <van-sku
      v-model="showBase"
      :sku="sku"
      :goods="goods"
      :goods-id="goodsId"
      :reset-stepper-on-hide="false"
      :reset-selected-sku-on-hide="false"
      :close-on-click-overlay="true"
      :disable-stepper-input="false"
      :quota-used="0"
      @sku-selected="switchProductType"
      @add-cart="onAddCartFn"
    />

    <van-goods-action>
      <van-goods-action-icon icon="chat-o" text="客服" 
      @click="onHelpBtn"/>
      <van-goods-action-icon icon="cart-o" :info=cartGoods_mini_num
      text="购物车" @click="gotoCartBtn"/>
      <van-goods-action-button type="warning" 
      text="加入购物车" @click="onClickBigBtn" />
      <van-goods-action-button type="danger" text="立即购买" />
    </van-goods-action>
  </div>
</template>

<script>
import axios from "axios";
import API_LIST from "@/APIList.config";

export default {
  name: "goodsProduct",
  data() {
    return {
      msg: "产品详情",
      goodsTitle: '',
      goodsImgUrl: '',
      describe: '',
      price: '',
      cartGoods_mini_num:0,

      showBase: false,
      goods: {},
      goodsId: '',
      sku: {
        // 所有sku规格类目与其值的从属关系，比如商品有颜色和尺码两大类规格，颜色下面又有红色和蓝色两个规格值。
        // 可以理解为一个商品可以有多个规格类目，一个规格类目下可以有多个规格值。
        tree: [
          {
            k: "类型", // skuKeyName：规格类目名称
            k_s: "s1", // skuKeyStr：sku 组合列表（下方 list）中当前类目对应的 key 值，value 值会是从属于当前类目的一个规格值 id
            v: [
              {
                id: "1", // skuValueId：规格值 id
                name: "红色", // skuValueName：规格值名称
                imgUrl: "https://img.yzcdn.cn/1.jpg", // 规格类目图片，只有第一个规格类目可以定义图片
                previewImgUrl: "https://img.yzcdn.cn/1p.jpg", // 用于预览显示的规格类目图片
              },
              {
                id: "1",
                name: "蓝色",
                imgUrl: "https://img.yzcdn.cn/2.jpg",
                previewImgUrl: "https://img.yzcdn.cn/2p.jpg",
              },
            ],
            largeImageMode: true, //  是否展示大图模式
          },
        ],
        // 所有 sku 的组合列表，比如红色、M 码为一个 sku 组合，红色、S 码为另一个组合
        list: [
          {
            id: 2259, // skuId
            s1: "1", // 规格类目 k_s 为 s1 的对应规格值 id
            s2: "1", // 规格类目 k_s 为 s2 的对应规格值 id
            price: "", // 价格（单位分）
            stock_num: 110, // 当前 sku 组合对应的库存
          },
        ],
        price: "", // 默认价格（单位元）
        stock_num: 227, // 商品总库存
        collection_id: 2261, // 无规格商品 skuId 取 collection_id，否则取所选 sku 组合对应的 id
        none_sku: false, // 是否无规格商品
        messages: [
          {
            // 商品留言
            datetime: "0", // 留言类型为 time 时，是否含日期。'1' 表示包含
            multiple: "0", // 留言类型为 text 时，是否多行文本。'1' 表示多行
            name: "留言", // 留言名称
            type: "text", // 留言类型，可选: id_no（身份证）, text, tel, date, time, email
            required: "0", // 是否必填 '1' 表示必填
            placeholder: "", // 可选值，占位文本
          },
        ],
        hide_stock: false, // 是否隐藏剩余库存
      },
    };
  },

  created() {
    console.log("1" + this.$route.query);
    let _goodsId = this.$route.query._goodsObjId;
    let _collectionName = this.$route.query._collectionName;

    this.getGoodsInfoFn(_goodsId, _collectionName);
    //给sku
    this.goodsId = _goodsId;

    //页面刚打开时，读取之前保存的产品数据
    //保存的是字符，所以要JSON.parse转为对象
   var xx = localStorage.cartDataInfo
      ? JSON.parse(localStorage.cartDataInfo)
      : [];

    console.log("本地存贮的内容是"+xx);

    //  localStorage.removeItem('cartDataInfo')

//购物车商品数量
   this.total_cartGoodsNum();
  },
  methods: {


    //添加购物车
    onAddCartFn(_d) {
      //真正的环境中，这个_d的数据是要发给后端接口的
      // console.log(_d);

      //cart数据中是否有相同的产品
 			let _isTrue = false;
			let _tempObj = {
					_id : _d.goodsId,
					_price : this.price,
					_num : _d.selectedNum,
					_goodsName : this.goodsTitle,
					_img : this.goodsImgUrl
        }
        console.log("价格"+this.price);
      console.log("页面信息"+_tempObj);

      //已经保存的数据
   	let _cartData = localStorage.cartDataInfo
							? JSON.parse( localStorage.cartDataInfo )
							: [];
			
			for(let i=0; i<_cartData.length; i++){
				//id相同，就是同一个产品
				if( _cartData[i]._id === _tempObj._id ){
					_cartData[i]._num += _tempObj._num;
					_isTrue = true;
					break;
				}
			}

     //没有相同的，才直接push
			if(!_isTrue) {
				_cartData.push(_tempObj)
			}

      //_tempObj是js的对象，要转为字符才能存到本地
      localStorage.cartDataInfo = JSON.stringify(_cartData);

       this.$dialog.alert({
            message: '加入购物车成功',})
            .then(()=>{
              this.showBase=false;
              this.total_cartGoodsNum();
            })

    },

    //当前购物车中商品总数
    total_cartGoodsNum(){
         	let _temp = localStorage.cartDataInfo
							? JSON.parse( localStorage.cartDataInfo )
              : [];
         let _n=0;
         for(let i=0;i<_temp.length;i++){
           _n+=_temp[i]._num;
                    }     
       this.cartGoods_mini_num=_n;
    },

    //根据id获得对应商品信息
    getGoodsInfoFn(_gId, _collectionName) {
      axios
        .get(API_LIST.getGoodsInfo, {
          params: {
            _id: _gId,
            _c: _collectionName,
          },
        })
        .then((_d) => {
          console.log(_d.data);
          this.goodsTitle = _d.data.name;
          this.goodsImgUrl = _d.data.img;
          this.describe = _d.data.describe;
          this.price = _d.data.price;

          //给goods的
          this.goods.title = _d.data.name;
          this.goods.picture = _d.data.img;
          this.sku.price = _d.data.price;
        });
    },

    //切换产品类型
    switchProductType() {
      this.sku.list[0].price = this.sku.price;
    },
    //加入购物车
    onClickBigBtn() {
      // console.log("123");
      this.showBase = true;
    },
//跳转到购物车页面
    gotoCartBtn(){
this.$router.push({path:'/cart'})
    },
    goBack() {
      this.$router.go(-1);
    },
    //客服按钮
    onHelpBtn(){
 this.$dialog.alert({
            message: '客服忙',})
    },
  },
};
</script>

<style scoped>
.goodsImgWrap {
  width: 100%;
  height: 350px;
  overflow: hidden;
  margin: 0 auto;
}
.goodsImgWrap img {
  width: 100%;
  height: 350px;
}
</style>