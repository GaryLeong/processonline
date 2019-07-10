package com.careland.processonline.mapper;

import com.careland.processonline.entity.MyUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Component;

/**
 * @author Administrator
 */
@Mapper
@Component
public interface MyUserMapper {
    /**
     * 用户登录
     * @param username
     * @param password
     * @return
     */
    MyUser userlogin(@Param("username") String username, @Param("password") String password);

    /**
     * 注册新用户(方式1)
     * @param username
     * @param password
     * @param age
     * @return
     */
    int adduser(@Param("username") String username, @Param("password") String password, @Param("age") int age);

    /**
     * 注册新用户（方式2）
     * @param username
     * @param password
     * @param age
     * @return
     */
    int adduser1(@Param("username") String username, @Param("password") String password, @Param("age") int age);
}