module.exports = {
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        root: __dirname,
        subtitle: 'Platform',
        description: 'How to use the Apollo GraphQL platform',
        contentDir: 'docs/source',
        basePath: '/docs',
        githubRepo: 'apollographql/apollo',
        spectrumPath: 'apollo-platform',
        sidebarCategories: {
          null: ['index', 'intro', 'intro/platform', 'intro/benefits'],
          Tutorial: [
            'tutorial/introduction',
            'tutorial/schema',
            'tutorial/data-source',
            'tutorial/resolvers',
            'tutorial/production',
            'tutorial/client',
            'tutorial/queries',
            'tutorial/mutations',
            'tutorial/local-state'
            // 'tutorial/whats-next'
          ],
          Platform: [
            'platform/schema-registry',
            'platform/schema-validation',
            'platform/client-awareness',
            'platform/operation-registry',
            'platform/editor-plugins',
            'platform/performance',
            'platform/integrations'
          ],
          Resources: [
            {
              title: 'Principled GraphQL',
              href: 'https://www.principledgraphql.com'
            },
            'resources/graphql-glossary',
            'resources/faq'
          ],
          References: [
            'references/apollo-config',
            'references/setup-analytics',
            'references/apollo-engine',
            'references/engine-proxy',
            'references/engine-proxy-release-notes'
          ]
        }
      }
    }
  ],
  plugins: [`gatsby-plugin-netlify-cms`]
};
