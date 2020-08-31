<template>
  <div>
 

    <van-nav-bar 
    :title="msg" 
    left-text="返回"
    right-text="退出登录"
     left-arrow 
     @click-right="logOutBtn" 
     @click-left="goback" />

     <div class="userImgDiv">
            <h1>欢迎：{{userNameObj.username}}</h1>
            <p>个人介绍：{{userNameObj.describe}}</p>

     </div>
  <footerBar></footerBar>
  </div>
</template>

<script>

import axios from "axios";
import API_LIST from "@/APIList.config";
import footerBar from './footerBar'
export default {
  name: "user_account",
  data() {
    return {
      msg: "个人中心",
      uObj:'',
      userNameObj:'',
    
    };
  },
  components:{footerBar},
  created(){
    this.userNameObj=JSON.parse(localStorage.userName);
  },
  methods:{
      goback(){
              this.$router.push({ path: "/" },()=>{
              localStorage.setItem('inxState',0);
          });
      },
      logOutBtn(){
          localStorage.userName='';
          this.$dialog.alert({
          message: '您已经退出登录',
        }).then(()=>{
          this.goback();
        })
      }
  }
}
</script>

<style scoped>
	.pr{position: relative;}
      .pa{position: absolute;}
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
      h2.title{font-size: 20px;text-align: center;}
      .cle:after{
        content: '.';
        overflow: hidden;
        visibility: hidden;
        height: 0;
        display: block;
        clear: both;
      }
      .wrapDiv{
        width: 90%;overflow: hidden;border: 1px solid #666;
        background: #eee;border-radius: 10px;
        margin:10px auto;
      }
      .userImgDiv{
      		
      		position: relative;border-radius: 10px;margin:10px;
              font-size: 22px;
      }
      .userImgDiv img{
      		position: absolute;top: 0;left: -20px;
      		width: 260px;
      }
      .userInfoDiv{
      		font-size: 14px;float: left;text-align: left;
      }
     .wrapDiv{
        width: 90%;overflow: hidden;border: 1px solid #666;
        background: #eee;border-radius: 10px;
        margin:10px auto;
      }
</style>