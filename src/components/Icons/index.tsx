import * as React from 'react'

const IconBase = ({ name, className = '' }) => (
  <svg className={`icon ${className}`} aria-hidden="true">
    <use xlinkHref={`#icon-${name}`} />
  </svg>
)

const Loading = () => <IconBase name="loading" className='loading' />

export { Loading }

export default IconBase
