declare namespace User {
  namespace GET {
    interface Body {
      email: string
      phone: string
      name: string
      class: number
      createTime: Date
      info: {
        avatar: string
        bio: string
        birthday: Date
        email: string
        gender: number
        location: string
        nickname: string
        phone: string
        url: string
      }
    }
  }
}
