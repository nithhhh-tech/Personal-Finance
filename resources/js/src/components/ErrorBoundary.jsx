import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        this.setState({ info });
        console.error('[ErrorBoundary] React rendering error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[60vh] items-start justify-center px-4 py-12">
                    <div className="w-full max-w-2xl rounded-xl border border-red-500/40 bg-red-950/30 p-6 text-[#f8efe3] shadow-xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-red-400">⚠ Page Error</p>
                        <h2 className="mt-2 text-xl font-bold text-red-200">
                            Something went wrong rendering this page.
                        </h2>
                        <p className="mt-2 text-sm text-[#d9c4ad]">
                            The app caught a JavaScript crash. Details below to help fix it:
                        </p>
                        <pre className="mt-4 max-h-56 overflow-auto rounded-lg border border-red-500/30 bg-[#1a0a08] p-4 text-xs leading-relaxed text-red-300 whitespace-pre-wrap">
                            {this.state.error?.toString()}
                            {'\n\n'}
                            {this.state.info?.componentStack}
                        </pre>
                        <button
                            type="button"
                            onClick={() => this.setState({ hasError: false, error: null, info: null })}
                            className="mt-5 rounded-md bg-[#d7a86e] px-4 py-2 text-sm font-bold text-[#2a1a12] hover:bg-[#e8bb82]"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
