/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: false,
    webpack: (config, { isServer }) => {
        config.externals.push('canvas')

        return config
    }
}

export default nextConfig
