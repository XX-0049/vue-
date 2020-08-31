<template>
  <div>
    <van-nav-bar v-bind:title="msg" left-text="返回" left-arrow @click-left="goBackfn" />
    <van-field
      v-model="username"
      clearable
      required
      label="用户名"
      placeholder="请输入用户名"
      @click-icon="username=''"
    />

    <van-field
      v-model="password"
      type="password"
      clearable
      required
      label="密码"
      placeholder="请输入密码"
      @click-icon="username=''"
    />

    <van-button type="danger" @click="userLoginFn">登录</van-button>
    <van-button type="danger" @click="registerBtn">注册</van-button>
    <footerBar></footerBar>
  </div>
</template>

<script>
import axios from "axios";
import API_LIST from "@/APIList.config";
import footerBar from "./footerBar";


export default {
  name: "userLogin",
  data() {
    return {
      msg: "登录页面",
      username: "",
      password: "",
    };
  },
  components: { footerBar },
  methods: {
    //回到上一步
    goBackfn() {
      this.$router.go(-1);
    },
    //注册页面
    registerBtn(){
this.$router.push({path:'/register'});
    },
    userLoginFn() {
      let _loginObj = {
        u: this.username,
        p: this.password,
      };
      // console.log(_loginObj)
      axios
        .post(API_LIST.userLogin_post, _loginObj)

        .then((_d) => {
          console.log(_d.data);

          this.$dialog
            .alert({
              message: "欢迎" + _d.data.regInfo.username + "登陆成功",
            })
            .then(() => {
              if (_d.data.reg_code === 3) {
                //转为字符串保存
                localStorage.userName = JSON.stringify(_d.data.regInfo);
              }

              //登录成功，回到首页
              this.$router.push({ path: "/" }, () => {
                localStorage.setItem("inxState", 0);
              });
            });
        });
    },
  },
};
</script>