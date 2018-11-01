import * as React from 'react'
import { LinearProgress as MaterialLinearProgress } from '@material-ui/core'

const LinearProgress = ({ loading, root = 'linearProgressRoot' }) =>
  loading ? <MaterialLinearProgress classes={{ root }} /> : null

export { LinearProgress }
export default { LinearProgress }
