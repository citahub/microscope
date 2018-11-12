import * as React from 'react'
import { Card, CardContent, } from '@material-ui/core'
import { TrendingFlat as ArrowIcon, } from '@material-ui/icons'

const styles = require('./staticCard.scss')

interface StaticCardProps {
  index?: number
  icon: string
  title: string
  page?: string
  className?: string
  children?: React.ReactNode
}

export default (props: StaticCardProps) => (
  <Card className={props.className || ''} elevation={0}>
    <h2 className={styles.title}>
      <img src={`${process.env.PUBLIC}${props.icon}`} alt="icon" />
      <span>{props.title}</span>
      {props.page ? (
        <a href={`/#/${props.page}`} className={styles.more}>
          More
          <ArrowIcon />
        </a>
      ) : null}
    </h2>
    <CardContent
      classes={{
        root: styles.cardContentRoot,
      }}
    >
      {props.children}
    </CardContent>
  </Card>
)

interface StaticCardProps {
  title: string
  page?: string
}

export const StaticCardTitle = props => (
  <h2 className={styles.onlytitle}>
    <span>{props.title}</span>
    {props.page ? (
      <a href={`/#/${props.page}`} className={styles.more}>
        {'More >'}
      </a>
    ) : null}
  </h2>
)
