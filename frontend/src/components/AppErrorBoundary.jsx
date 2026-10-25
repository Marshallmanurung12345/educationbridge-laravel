import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("EducationBridge gagal menampilkan halaman.", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-12">
          <section role="alert" className="w-full max-w-lg rounded-xl border border-rose-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <h1 className="page-title text-[#17345B]">Halaman gagal dimuat</h1>
            <p className="mt-3 text-sm leading-6 text-[#667085]">
              Terjadi kendala saat menampilkan halaman. Muat ulang terlebih dahulu.
              Jika masih terjadi, hubungi admin dan kirim tangkapan layar pesan ini.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 min-h-11 rounded-lg bg-[#17345B] px-5 text-sm font-semibold text-white hover:bg-[#244a79]"
            >
              Muat Ulang Halaman
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
