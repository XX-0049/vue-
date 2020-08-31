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
      :error-message="userErr"
    />

    <van-field
      v-model="password"
      type="password"
      clearable
      required
      label="密码"
      placeholder="请输入密码"
      @click-icon="username=''"
      :error-message="passErr"
    />

    <van-field
      v-model="password2"
      type="password"
      clearable
      required
      label="重复密码"
      placeholder="请重复输入密码"
      @click-icon="username=''"
      :error-message="passErr2"
    />

    <van-field v-model="describe" label="个人签名" placeholder="请个人签名" :error-message="userErr" />
    <van-button type="danger" @click="registerFn">立即注册</van-button>
    <van-button type="danger" @click="registerResetBtn">重置</van-button>
      <footerBar></footerBar>
  </div>
</template>

<script>
import axios from "axios";
import API_LIST from "@/APIList.config";
import footerBar from './footerBar'

export default {
  name: "register",
  data() {
    return {
      msg: "注册页面",
      username: "",
      password: "",
      password2: "",
      describe: "",
      userErr: "",
      passErr: "",
      passErr2: "",
    };
  },
  components:{footerBar},
  methods: {
    //回到上一步
    goBackfn() {
      this.$router.go(-1);
    },

    //注册
    registerFn() {
      //注册信息Obj
      let _registerObj = {
        username: this.username,
        password: this.password,
        password2: this.password2,
        describe: this.describe,
      };
      if (_registerObj.username === "") {
        this.userErr = "用户名不能为空";
        return false;
      }

      if (_registerObj.password === "") {
        this.passErr = "密码不能为空";
        return false;
      }

      if (_registerObj.password2 === "") {
        this.passErr2 = "重复密码不能为空";
        return false;
      }

      if (_registerObj.password !== _registerObj.password2) {
        this.passErr2 = "重复密码不一致";
        return false;
      }

      console.log(_registerObj);
      this.postRegisterObj(_registerObj);
    },

    //提交
    postRegisterObj(_registerObj) {
      axios.post(API_LIST.register_post, _registerObj).then((_d) => {
        console.log(_d.data);

        this.$dialog.alert({
          message: _d.data.regInfo,
        }).then(()=>{
          //注册成功，回到首页
          this.$router.push({path:'/'});
        })
      });
    },
    //重置
    registerResetBtn() {},
  },
};
</script>