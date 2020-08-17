const cookieparser = require('cookieparser')

export default function ({ req, redirect }) {
  const parsed = cookieparser.parse(req.headers.cookie || '')
  if (!parsed.token) {
    return redirect('/login')
  }
}
