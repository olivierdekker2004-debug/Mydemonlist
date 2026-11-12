
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    'https://aqkrtixtxwtqqabeeghw.supabase.co',
    'sb_publishable_Y3POVCyEo2Hr_iUAI7Td2A_lkW5IYQz'
);

export default {
    name: 'Login',

    data() {
        return {
            mode: 'login',
            username: '',
            email: '',
            password: '',
            loading: false,
            error: '',
            success: '',
        };
    },

    template: `
        <main style="
            min-height: 75vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
        ">
            <div style="
                width: 100%;
                max-width: 420px;
                padding: 35px;
                background: #17191f;
                border: 1px solid #30333d;
                border-radius: 16px;
                box-shadow: 0 15px 50px #0006;
                color: white;
            ">
                <div style="text-align:center; margin-bottom:28px;">
                    <div style="
                        font-size: 32px;
                        font-weight: 800;
                        color: #ed4141;
                        margin-bottom: 8px;
                    ">THE CLUTTERFUNK DEMONLIST</div>

                    <h1 style="font-size:28px; margin:0 0 8px;">
                        {{ mode === 'login' ? 'Login' : 'Register' }}
                    </h1>

                    <p style="color:#a5a8b3; margin:0;">
                        {{ mode === 'login'
                            ? 'Welcome back!'
                            : 'Create your account' }}
                    </p>
                </div>

                <div style="
                    display:flex;
                    gap:8px;
                    margin-bottom:24px;
                    padding:5px;
                    background:#101116;
                    border-radius:10px;
                ">
                    <button
                        type="button"
                        @click="switchMode('login')"
                        :style="tabStyle('login')"
                    >Login</button>

                    <button
                        type="button"
                        @click="switchMode('register')"
                        :style="tabStyle('register')"
                    >Register</button>
                </div>

                <form @submit.prevent="submit">
                    <div v-if="mode === 'register'" style="margin-bottom:16px;">
                        <label style="display:block; margin-bottom:7px;">Username</label>
                        <input
                            v-model.trim="username"
                            type="text"
                            placeholder="Choose a username"
                            autocomplete="username"
                            maxlength="24"
                            required
                            style="width:100%; box-sizing:border-box; padding:13px; border-radius:8px; border:1px solid #393c47; background:#22252d; color:white; outline:none;"
                        />
                    </div>

                    <div v-if="mode === 'register'" style="margin-bottom:16px;">
                        <label style="display:block; margin-bottom:7px;">Email</label>
                        <input
                            v-model.trim="email"
                            type="email"
                            placeholder="Enter your email"
                            autocomplete="email"
                            required
                            style="width:100%; box-sizing:border-box; padding:13px; border-radius:8px; border:1px solid #393c47; background:#22252d; color:white; outline:none;"
                        />
                    </div>

                    <div v-if="mode === 'login'" style="margin-bottom:16px;">
                        <label style="display:block; margin-bottom:7px;">Username</label>
                        <input
                            v-model.trim="username"
                            type="text"
                            placeholder="Your username"
                            autocomplete="username"
                            required
                            style="width:100%; box-sizing:border-box; padding:13px; border-radius:8px; border:1px solid #393c47; background:#22252d; color:white; outline:none;"
                        />
                    </div>

                    <div style="margin-bottom:20px;">
                        <label style="display:block; margin-bottom:7px;">Password</label>
                        <input
                            v-model="password"
                            type="password"
                            placeholder="Enter your password"
                            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                            minlength="6"
                            required
                            style="width:100%; box-sizing:border-box; padding:13px; border-radius:8px; border:1px solid #393c47; background:#22252d; color:white; outline:none;"
                        />
                    </div>

                    <p v-if="error" style="
                        color:#ff6666;
                        background:#391d22;
                        padding:11px;
                        border-radius:8px;
                        font-size:14px;
                    ">{{ error }}</p>

                    <p v-if="success" style="
                        color:#65d99b;
                        background:#193329;
                        padding:11px;
                        border-radius:8px;
                        font-size:14px;
                    ">{{ success }}</p>

                    <button
                        type="submit"
                        :disabled="loading"
                        style="
                            width:100%;
                            padding:14px;
                            border:0;
                            border-radius:9px;
                            background:#e43e43;
                            color:white;
                            font-size:16px;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        {{ loading
                            ? 'Please wait...'
                            : mode === 'login' ? 'Login' : 'Create account' }}
                    </button>
                </form>

                <p style="
                    text-align:center;
                    color:#888d99;
                    font-size:12px;
                    margin:24px 0 0;
                ">
                    The Clutterfunk Demonlist
                </p>
            </div>
        </main>
    `,

    methods: {
        tabStyle(tab) {
            return {
                flex: '1',
                padding: '11px',
                border: 'none',
                borderRadius: '7px',
                background: this.mode === tab ? '#e43e43' : 'transparent',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer',
            };
        },

        switchMode(mode) {
            this.mode = mode;
            this.error = '';
            this.success = '';
            this.password = '';
        },

        async submit() {
            this.loading = true;
            this.error = '';
            this.success = '';

            try {
                if (this.mode === 'register') {
                    if (!/^[a-zA-Z0-9_]{3,24}$/.test(this.username)) {
                        throw new Error(
                            'Username must be 3–24 characters and contain only letters, numbers or underscores.'
                        );
                    }

                    const { data: existing, error: checkError } =
                        await supabase
                            .from('profiles')
                            .select('id')
                            .ilike('username', this.username)
                            .maybeSingle();

                    if (checkError) throw checkError;

                    if (existing) {
                        throw new Error('This username is already taken.');
                    }

                    const { data, error } = await supabase.auth.signUp({
                        email: this.email,
                        password: this.password,
                        options: {
                            data: {
                                username: this.username,
                            },
                        },
                    });

                    if (error) throw error;

                    if (data.session) {
                        this.success = 'Account created! You are now logged in.';
                        this.username = '';
                        this.email = '';
                        this.password = '';
                    } else {
                        this.success =
                            'Account created! Check your email to confirm your account before logging in.';
                        this.password = '';
                    }
                } else {
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

                    localStorage.setItem(
                        'clutterfunk_role',
                        data.role || 'member'
                    );

                    this.$router.push('/');
                }
            } catch (error) {
                console.error(error);
                this.error = error.message || 'Something went wrong.';
            } finally {
                this.loading = false;
            }
        },
    },
};
