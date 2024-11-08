import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';

const Footer = () => {
  const intl = useIntl();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              {intl.formatMessage({ id: 'footer.company' })}
            </h3>
            <p className="mt-4 text-base text-gray-500">
              contact@sponge-theory.ai
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              {intl.formatMessage({ id: 'footer.legal' })}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/terms" className="text-base text-gray-500 hover:text-gray-900">
                  {intl.formatMessage({ id: 'footer.terms' })}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                  {intl.formatMessage({ id: 'footer.privacy' })}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-base text-gray-400">
            © {currentYear} Sponge-Theory.ai. {intl.formatMessage({ id: 'footer.rights' })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
