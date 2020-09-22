type Suggester = {
  [key: string]: {
    term: {
      field: string;
    };
  };
};

type Generators = {
  field: string;
  suggest_mode: string;
};

type Phrase = {
  [key: string]: {
    phrase: {
      field: string;
      size?: number;
      gram_size?: number;
      direct_generator?: Array<Generators>;
    };
  };
};

export namespace Suggesters {
  export const Video: { suggesters: Suggester; phrases: Phrase } = {
    suggesters: {
      'vd-suggester': {
        term: {
          field: 'description',
        },
      },
      'vtag-suggester': {
        term: {
          field: 'tags',
        },
      },
    },
    phrases: {
      'vt-phrase': {
        phrase: {
          field: 'title.trigram',
          size: 1,
          gram_size: 3,
          direct_generator: [
            {
              field: 'title.trigram',
              suggest_mode: 'always',
            },
          ],
        },
      },
    },
  };

  export const User: { phrases: Phrase } = {
    phrases: {
      'un-suggester': {
        phrase: {
          field: 'name.trigram',
          size: 1,
          gram_size: 3,
          direct_generator: [
            {
              field: 'name.trigram',
              suggest_mode: 'always',
            },
          ],
        },
      },
      'uu-suggester': {
        phrase: {
          field: 'username.trigram',
          size: 1,
          gram_size: 3,
          direct_generator: [
            {
              field: 'username.trigram',
              suggest_mode: 'always',
            },
          ],
        },
      },
    },
  };

  export const Channel: { phrases: Phrase; suggeters: Suggester } = {
    suggeters: {
      'cd-suggester': {
        term: {
          field: 'description',
        },
      },
    },
    phrases: {
      'ct-suggeter': {
        phrase: {
          field: 'title.trigram',
          size: 1,
          gram_size: 3,
          direct_generator: [
            {
              field: 'title.trigram',
              suggest_mode: 'always',
            },
          ],
        },
      },
    },
  };
}
