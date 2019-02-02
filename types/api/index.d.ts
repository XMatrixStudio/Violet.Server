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
        email: string
        location: string
        nickname: string
        url: string
      }
    }
  }
}
