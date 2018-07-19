export const handleError = ctx => error => {

  if (window.localStorage.getItem('chainId')) {
    // only active when chain ip exsits
    ctx.setState(state => ({
      loading: state.loading - 1,
      error,
    }))
  }
}

export const dismissError = ctx => e => {
  ctx.setState({ error: { message: '', code: '' } })
}
