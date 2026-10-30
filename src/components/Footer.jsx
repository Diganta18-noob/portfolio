import { portfolioConfig } from "../portfolioConfig";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <center>
        <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
        <span className="block text-sm pb-4 text-gray-500 text-center dark:text-gray-400">
          © {currentYear}{" "}
          <a href="/#Home" className="hover:underline">
            {portfolioConfig.personalInfo.name}
          </a>
          . All Rights Reserved. <a href="/login" className="ml-3 hover:underline">Admin</a>
        </span>
      </center>
    </footer>
  );
};

export default Footer;