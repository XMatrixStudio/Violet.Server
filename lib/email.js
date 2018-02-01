require('date-utils')
const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')

exports.sendEmailCode = async (email, name, code) => {
  let mail = fs.readFileSync(path.join(__dirname, '../config/mail-cn.html')).toString()
  mail = mail.replace('<%=name%>', name).replace('<%=code%>', code).replace('<%=time%>', (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS'))
  fs.writeFileSync(path.join(__dirname, '../config/tmp'), mail)
  childProcess.exec(`echo '' | mutt -i ./config/tmp -s '[Violet]邮箱验证码' -F ./config/muttrc.conf ${email}`)
}
