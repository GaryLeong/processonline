package com.careland.processonline.service;

import com.careland.processonline.entity.MyUser;
import com.careland.processonline.mapper.MyUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * @author Administrator
 */
@Service("UserLoginService")
public class UserLoginService {
    /**
     * 注入dao
     */
    @Autowired
    private MyUserMapper myUserMapper;

    /**
     * 用户登录
     * @param username
     * @param password
     * @return
     */
    public MyUser userLogin(String username, String password) {
        MyUser user = myUserMapper.userlogin(username, password);
        return user;
    }

    /**
     * 注册新用户
     * @param username
     * @param password
     * @param age
     * @return
     */
    public int adduser(String username, String password, int age) {
        return myUserMapper.adduser(username, password, age);
    }

    /**
     * 注册新用户（方式2）
     * @param username 用户名
     * @param password 密码
     * @param age 年龄
     * @return 注册结果
     */
    public int addUser1(String username, String password, int age)
    {
        return  myUserMapper.adduser1(username, password, age);
    }
}