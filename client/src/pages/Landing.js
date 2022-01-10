import main from '../assets/images/main.svg'
import Wrapper from '../assets/wrappers/LandingPage'
import { Logo } from '../components'

const Landing = () => {
  return (
    <Wrapper>
      <nav>
        {/* TODO: change log to Jobtrak */}
        <Logo />
      </nav>
      <div class='container page'>
        {/* info */}
        <div class='info'>
          <h1>
            job <span>tracking</span> app
          </h1>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eligendi
            autem laboriosam nostrum deserunt, earum quam quos fugiat est iure,
            laudantium totam non quisquam consectetur quod id neque, dolor illo!
            Magni.
          </p>
          <button className='btn btn-hero'>Login/Register</button>
        </div>
        <img src={main} alt='job hunt' className='img main-img' />
      </div>
    </Wrapper>
  )
}

export default Landing
