import * as React from 'react'

const styles = require('./icons.scss')

const IconBase = ({ name, className = '' }) => (
  <svg className={`icon ${className}`} aria-hidden="true">
    <use xlinkHref={`#icon-${name}`} />
  </svg>
)

const Loading = () => <IconBase name="loading" className={styles.loading} />

export { Loading, IconBase }

export default IconBase
