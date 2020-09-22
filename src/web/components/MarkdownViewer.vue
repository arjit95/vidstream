<template>
  <markdown-it-vue
    ref="markdown"
    class="markdown-content"
    :content="formatted"
    :options="options"
  />
</template>

<style>
.markdown-content a {
  color: var(--v-anchor-base) !important;
}
</style>
<script>
import MarkdownItVue from 'markdown-it-vue'
export default {
  name: 'MarkdownViewer',
  components: { MarkdownItVue },
  props: {
    source: {
      type: String,
      default: () => '',
    },
  },
  data() {
    return {
      options: {
        markdownIt: {
          linkify: true,
        },
      },
      schemas: {
        '@': {
          validate(text, pos, self) {
            const tail = text.slice(pos)

            if (!self.re.mention) {
              self.re.mention = new RegExp(
                '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
              )
            }
            if (self.re.mention.test(tail)) {
              // Linkifier allows punctuation chars before prefix,
              // but we additionally disable `@` ("@@mention" is invalid)
              if (pos >= 2 && tail[pos - 2] === '@') {
                return false
              }
              return tail.match(self.re.mention)[0].length
            }

            return 0
          },
          normalize(match) {
            match.url = `/profile/${match.url.replace(/^@/, '')}`
          },
        },
        '#': {
          validate(text, pos, self) {
            const tail = text.slice(pos)

            if (!self.re.tag) {
              self.re.tag = new RegExp(
                '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
              )
            }
            if (self.re.tag.test(tail)) {
              if (
                pos >= 2 &&
                (tail[pos - 2] === '#' || tail[pos - 2] === ' ')
              ) {
                return false
              }
              return tail.match(self.re.tag)[0].length
            }

            return 0
          },
          normalize(match) {
            const q = match.url.replace(/^#/, '')
            match.url = `/search?q=${q}&type=tag`
          },
        },
      },
    }
  },
  computed: {
    formatted() {
      const formatted = this.source
        .trim()
        .split(/\r\n|\r|\n/g)
        .map((l, idx, arr) => {
          if (idx < arr.length - 1) {
            const header = /^(#+) (\w)/
            const nextLine = arr[idx + 1]
            if (!header.test(nextLine)) {
              l += '\\'
            }
          }

          return l + '\n'
        })

      return formatted.join('')
    },
  },
  mounted() {
    Object.keys(this.schemas).forEach((key) => {
      this.$refs.markdown.md.linkify.add(key, this.schemas[key])
    })
  },
}
</script>
