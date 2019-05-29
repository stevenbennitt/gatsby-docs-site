import React from 'react'
import PropTypes from 'prop-types'
import { ConceptDocTemplate } from '../../templates/concept-doc'

const ConceptDocPreview = ({ entry, widgetFor }) => (
  <ConceptDocTemplate
    content={widgetFor('body')}
    description={entry.getIn(['data', 'description'])}
    tags={entry.getIn(['data', 'tags'])}
    title={entry.getIn(['data', 'title'])}
  />
)

ConceptDocPreview.propTypes = {
  entry: PropTypes.shape({
    getIn: PropTypes.func,
  }),
  widgetFor: PropTypes.func,
}

export default ConceptDocPreview
