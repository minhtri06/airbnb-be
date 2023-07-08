def get_users_mysql():
    sql = "INSERT INTO users (user_name,user_email,user_password,user_authType,user_roles,user_avatar,user_dateOfBirth,user_gender,user_address) VALUES ("
    n = 1000
    with open('crawl-data/output_get_users_mysql.sql', 'w') as f:
        for i in range(1,n+1):
            name = "'Tuan Le " + str(i) + "'"
            f.writelines(sql + name + "," + name + ","+ name + ","+ name + ","+ name + ","+ name + ","+ name + ","+ name + ","+ name + ');')
            f.writelines('\n')

if __name__ == "__main__":
    get_users_mysql()