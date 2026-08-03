import { useState } from 'react';
import { ShieldCheck, Sun, Moon } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError } from '../lib/format.js';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx';

export default function AuthScreen({ onAuthed, darkMode, toggleTheme }) {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', base_currency: 'USD' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const endpoint = mode === 'login' ? '/login' : '/register';
            const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
            const response = await api.post(endpoint, payload);
            onAuthed(response.data.token);
        } catch (err) {
            setError(readError(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="absolute top-6 right-6 z-20">
                <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
                    {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-600" />}
                    <span>{darkMode ? 'Light' : 'Dark'}</span>
                </Button>
            </div>

            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm font-bold text-lg">
                        P
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Personal Finance Tracker</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Know exactly where your money goes.</p>
                </div>

                <Card className="border shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl font-bold">Welcome</CardTitle>
                        <CardDescription>Sign in or create an account to continue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={mode} onValueChange={setMode} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="login" id="tab-login">Log in</TabsTrigger>
                                <TabsTrigger value="register" id="tab-register">Register</TabsTrigger>
                            </TabsList>

                            <form onSubmit={submit} className="space-y-4">
                                {mode === 'register' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Your name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                </div>

                                {mode === 'register' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="base_currency">Base Currency</Label>
                                        <Select
                                            value={form.base_currency}
                                            onValueChange={(val) => setForm({ ...form, base_currency: val })}
                                        >
                                            <SelectTrigger id="base_currency" className="w-full">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD – US Dollar</SelectItem>
                                                <SelectItem value="KHR">KHR – Cambodian Riel</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {error && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button type="submit" className="w-full mt-2" disabled={submitting} id="auth-submit-btn">
                                    {submitting ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
                                </Button>
                            </form>
                        </Tabs>

                        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            <ShieldCheck className="size-4" />
                            <span>Protected by Laravel Sanctum tokens</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
