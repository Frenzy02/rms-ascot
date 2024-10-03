import { motion } from 'framer-motion'

const AnimatedTooltip = ({ content, position = 'top' }) => {
    const tooltipPosition = {
        top: 'bottom-full mb-2',
        right: 'left-full ml-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2'
    }[position]

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute ${tooltipPosition} z-10 px-2 py-1 text-xs font-medium text-white bg-gray-700 rounded shadow-lg`}>
            {content}
        </motion.div>
    )
}
