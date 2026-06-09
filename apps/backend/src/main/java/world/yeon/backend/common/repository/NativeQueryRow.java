package world.yeon.backend.common.repository;

public record NativeQueryRow(Object[] values, String label) {
	public static NativeQueryRow require(Object raw, int min, String label) {
		Object[] values = raw instanceof Object[] rowValues ? rowValues : new Object[]{raw};
		if (values.length < min) {
			throw new IllegalStateException(label + "를 해석하지 못했습니다. 필요한 컬럼: " + min + ", 실제 컬럼: " + values.length);
		}
		return new NativeQueryRow(values, label);
	}

	public NativeQueryValue valueAt(int index) {
		if (index >= values.length) {
			throw new IllegalStateException(label + "의 " + index + "번째 컬럼을 읽을 수 없습니다.");
		}
		return new NativeQueryValue(values[index], label + "[" + index + "]");
	}
}
