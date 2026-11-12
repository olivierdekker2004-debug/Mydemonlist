
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    'https://aqkrtixtxwtqqabeeghw.supabase.co',
    'sb_publishable_Y3POVCyEo2Hr_iUAI7Td2A_lkW5IYQz'
);

export default {
    name: 'Login',

    data() {
        return {
            username: '',
            password: '',
            loading: false,
            error: '',
        };
    },

    template: `
        <main class="login-page">
            <div class="login-card">
                <h1>Admin Login</h1>
                <p>The Clutterfunk Demonlist</p>

                <form @submit.prevent="login">
                    <label>Username</label>
                    <input
                        v-model="username"
                        type="text"
                        placeholder="Username"
                        autocomplete="username"
                        required
                    />

                    <label>Password</label>
                    <input
                        v-model="password"
                        type="password"
                        placeholder="Password"
                        autocomplete="current-password"
                        required
                    />

                    <p v-if="error" class="login-error">
                        {{ error }}
                    </p>

                    <button type="submit" :disabled="loading">
                        {{ loading ? 'Logging in...' : 'Login' }}
                    </button>
                </form>
            </div>
        </main>
    `,

    methods: {
        async login() {
            this.loading = true;
            this.error = '';

            try {
                const { data, error } = await supabase.functions.invoke(
                    'username-login',
                    {
                        body: {
                            username: this.username,
                            password: this.password,
                        },
                    }
                );

                if (error) throw error;

                if (!data?.success || !data?.session) {
                    throw new Error(
                        data?.error || 'Login failed.'
                    );
                }

                const { error: sessionError } =
                    await supabase.auth.setSession({
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    });

                if (sessionError) throw sessionError;

                if (!['owner', 'admin', 'helper', 'trial', 'dev']
                    .includes(data.role)) {
                    await supabase.auth.signOut();
                    throw new Error('You do not have staff access.');
                }

                localStorage.setItem(
                    'clutterfunk_role',
                    data.role
                );

                this.$router.push('/');
            } catch (error) {
                console.error('Login error:', error);
                this.error =
                    error.message || 'Could not log in.';
            } finally {
                this.loading = false;
            }
        },
    },
};

