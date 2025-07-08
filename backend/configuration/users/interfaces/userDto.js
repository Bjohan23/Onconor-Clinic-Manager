class UserDto {
    constructor({ id, email, username,active, establishment_id, person_num_doc, user_updated, password ,flg_deleted ,deleted_at ,user_created ,user_deleted}) {
      this.id = id;
      this.email = email;
      this.username = username;
      this.active = active;
      this.establishment_id = establishment_id;
      this.person_num_doc = person_num_doc;
      this.password = password;
      this.user_updated = user_updated;
      this.flg_deleted = flg_deleted ;
      this.deleted_at = deleted_at;
      this.user_created = user_created;
      this.user_deleted = user_deleted;
    }
  }

  module.exports = UserDto;