// 块级作用域
{
  let x = 1
  const y = 2
  {
    let x = 10
    console.log(x)
  }
}

