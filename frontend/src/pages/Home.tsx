import { ArrowRight, Brain, Sparkles, Zap } from 'lucide-react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

const Home = () => {
  const intl = useIntl();

  return (
    <div className="bg-white">
      <div className="relative isolate">
        {/* Hero section */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-radial from-primary-100 to-transparent opacity-40" />
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center relative">
              <div className="flex justify-center mb-8">
                <Brain className="h-16 w-16 text-primary-600" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                {intl.formatMessage(
                  { id: 'home.hero.title' },
                  { appName: intl.formatMessage({ id: 'app.name' }) }
                )}
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {intl.formatMessage({ id: 'home.hero.subtitle' })}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 relative z-20">
                <Link
                  to="/pricing"
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  {intl.formatMessage({ id: 'home.cta.getStarted' })}
                </Link>
                <Link
                  to="/features"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  {intl.formatMessage({ id: 'home.cta.learnMore' })} <ArrowRight className="inline-block ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">
              {intl.formatMessage({ id: 'features.section.technology' })}
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {intl.formatMessage({ id: 'features.section.subtitle' })}
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Sparkles className="h-5 w-5 flex-none text-primary-600" />
                  {intl.formatMessage({ id: 'features.models' })}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{intl.formatMessage({ id: 'features.models.desc' })}</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Zap className="h-5 w-5 flex-none text-primary-600" />
                  {intl.formatMessage({ id: 'features.api' })}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{intl.formatMessage({ id: 'features.api.desc' })}</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Brain className="h-5 w-5 flex-none text-primary-600" />
                  {intl.formatMessage({ id: 'features.learning' })}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{intl.formatMessage({ id: 'features.learning.desc' })}</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;