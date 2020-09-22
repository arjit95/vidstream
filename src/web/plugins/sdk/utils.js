import humanize from 'humanize-plus'

export default class {
  static pluralize(num, text) {
    if (!num) {
      return `No ${humanize.capitalize(text)}s`
    }

    return humanize.compactInteger(num) + ' ' + humanize.pluralize(num, text)
  }
}
